import { db } from '../db/client.js'
import { tasks, subTasks, taskProgress } from '../db/schema.js'
import { eq, and, sql, count, inArray } from 'drizzle-orm'
import { authPreHandler } from '../middleware/auth.js'
import { nanoid } from 'nanoid'

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) + '-' + nanoid(6)
}

export function registerUgcRoutes(app) {
  /**
   * POST /api/ugc/tasks
   * Create a new task (user-generated content).
   * Status is set to 'pending_review' and requires admin approval.
   */
  app.post('/api/ugc/tasks', { preHandler: authPreHandler }, async (request, reply) => {
    const userId = request.userId
    const body = request.body || {}

    const required = ['title', 'description', 'city']
    for (const field of required) {
      if (!body[field]) return reply.code(400).send({ error: `Missing required field: ${field}` })
    }

    if (!body.subTasks || !Array.isArray(body.subTasks) || body.subTasks.length === 0) {
      return reply.code(400).send({ error: 'At least one sub-task is required' })
    }

    const slug = body.slug || slugify(body.title)

    // Check slug uniqueness
    const [existing] = await db.select({ id: tasks.id }).from(tasks)
      .where(eq(tasks.slug, slug)).limit(1)
    if (existing) {
      return reply.code(409).send({ error: 'Slug already exists' })
    }

    // Insert task
    const [task] = await db.insert(tasks).values({
      slug,
      title: body.title,
      description: body.description,
      city: body.city,
      coverImage: body.coverImage || null,
      estimatedMinutes: body.estimatedMinutes || null,
      difficulty: body.difficulty || 'medium',
      badgeName: body.badgeName || null,
      badgeIcon: body.badgeIcon || null,
      badgeColor: body.badgeColor || null,
      locationSummary: body.locationSummary || null,
      status: 'pending_review',
      createdBy: userId,
    }).returning()

    // Insert sub-tasks
    const subTaskValues = body.subTasks.map((st, i) => ({
      taskId: task.id,
      orderIndex: st.orderIndex || (i + 1),
      type: st.type || 'photo',
      title: st.title || `Step ${i + 1}`,
      instruction: st.instruction || '',
      locationName: st.locationName || null,
      locationAddress: st.locationAddress || null,
      locationLat: st.locationLat ? String(st.locationLat) : null,
      locationLng: st.locationLng ? String(st.locationLng) : null,
      validationConfig: st.validationConfig || null,
      hints: st.hints || null,
    }))

    const insertedSubs = await db.insert(subTasks).values(subTaskValues).returning()

    return reply.code(201).send({
      task,
      subTasks: insertedSubs,
      message: 'Task submitted for review',
    })
  })

  /**
   * GET /api/ugc/tasks
   * List tasks created by the current user.
   */
  app.get('/api/ugc/tasks', { preHandler: authPreHandler }, async (request) => {
    const userId = request.userId
    const { page = '1', pageSize = '20' } = request.query
    const limit = Math.min(parseInt(pageSize, 10), 100)
    const offset = (parseInt(page, 10) - 1) * limit

    const [items, countResult] = await Promise.all([
      db.select().from(tasks)
        .where(eq(tasks.createdBy, userId))
        .orderBy(tasks.createdAt)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(tasks)
        .where(eq(tasks.createdBy, userId)),
    ])

    // Get subtask count for each task
    let subCounts = []
    if (items.length > 0) {
      subCounts = await db.select({
        taskId: subTasks.taskId,
        count: count(),
      }).from(subTasks)
        .where(inArray(subTasks.taskId, items.map(t => t.id)))
        .groupBy(subTasks.taskId)
    }
    const countMap = Object.fromEntries(subCounts.map(r => [r.taskId, Number(r.count)]))

    return {
      items: items.map(t => ({ ...t, subTaskCount: countMap[t.id] || 0 })),
      total: Number(countResult[0]?.count ?? 0),
      page: parseInt(page, 10),
      pageSize: limit,
    }
  })

  /**
   * GET /api/ugc/tasks/:id/stats
   * Get stats for a user-created task.
   */
  app.get('/api/ugc/tasks/:id/stats', { preHandler: authPreHandler }, async (request, reply) => {
    const userId = request.userId
    const { id } = request.params

    const [task] = await db.select().from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.createdBy, userId)))
      .limit(1)
    if (!task) return reply.code(404).send({ error: 'Task not found' })

    const [completionResult] = await db.select({ count: count() })
      .from(taskProgress)
      .where(and(
        eq(taskProgress.taskId, task.id),
        eq(taskProgress.status, 'completed'),
      ))

    return {
      taskId: task.id,
      title: task.title,
      status: task.status,
      completionCount: task.completionCount,
      avgRating: task.avgRating,
      ratingCount: task.ratingCount,
      totalCompletions: Number(completionResult?.count ?? 0),
    }
  })
}


