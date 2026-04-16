import { db } from '../db/client.js'
import { tasks, subTasks, taskReviews } from '../db/schema.js'
import { eq, sql, and, count, inArray } from 'drizzle-orm'
import { config } from '../config.js'

/**
 * Admin auth preHandler — checks for x-admin-secret header.
 * Falls back to ADMIN_SECRET env var or 'ducheng-admin-2024'.
 */
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'ducheng-admin-2024'

async function adminPreHandler(request, reply) {
  const secret = request.headers['x-admin-secret']
  if (secret !== ADMIN_SECRET) {
    return reply.code(401).send({ error: 'Invalid admin secret' })
  }
}

export function registerAdminRoutes(app) {

  // ─── Task CRUD ────────────────────────────────────────────────

  /**
   * GET /api/admin/tasks
   * List all tasks (including drafts), with optional filters.
   */
  app.get('/api/admin/tasks', { preHandler: adminPreHandler }, async (request) => {
    const { city, status, page = '1', pageSize = '20' } = request.query

    const conditions = []
    if (city) conditions.push(eq(tasks.city, city))
    if (status) conditions.push(eq(tasks.status, status))

    const limit = Math.min(parseInt(pageSize, 10), 100)
    const offset = (parseInt(page, 10) - 1) * limit

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [items, countResult] = await Promise.all([
      db.select().from(tasks)
        .where(where)
        .orderBy(tasks.createdAt)
        .limit(limit)
        .offset(offset),
      db.select({ count: sql`count(*)` }).from(tasks)
        .where(where),
    ])

    return {
      items,
      total: Number(countResult[0]?.count ?? 0),
      page: parseInt(page, 10),
      pageSize: limit,
    }
  })

  /**
   * POST /api/admin/tasks
   * Create a new task.
   */
  app.post('/api/admin/tasks', { preHandler: adminPreHandler }, async (request, reply) => {
    const body = request.body || {}
    const required = ['slug', 'title', 'description', 'city']
    for (const field of required) {
      if (!body[field]) return reply.code(400).send({ error: `Missing required field: ${field}` })
    }

    const [task] = await db.insert(tasks).values({
      slug: body.slug,
      title: body.title,
      description: body.description,
      coverImage: body.coverImage || null,
      estimatedMinutes: body.estimatedMinutes || null,
      difficulty: body.difficulty || 'medium',
      badgeName: body.badgeName || null,
      badgeIcon: body.badgeIcon || null,
      badgeColor: body.badgeColor || null,
      locationSummary: body.locationSummary || null,
      city: body.city,
      status: body.status || 'draft',
      createdBy: body.createdBy || null,
    }).returning()

    return reply.code(201).send(task)
  })

  /**
   * PUT /api/admin/tasks/:slug
   * Update a task by slug.
   */
  app.put('/api/admin/tasks/:slug', { preHandler: adminPreHandler }, async (request, reply) => {
    const { slug } = request.params
    const body = request.body || {}

    const [existing] = await db.select().from(tasks)
      .where(eq(tasks.slug, slug)).limit(1)
    if (!existing) return reply.code(404).send({ error: 'Task not found' })

    const updates = {}
    const updatable = ['title', 'description', 'coverImage', 'estimatedMinutes', 'difficulty',
      'badgeName', 'badgeIcon', 'badgeColor', 'locationSummary', 'city', 'status']
    for (const key of updatable) {
      if (body[key] !== undefined) updates[key] = body[key]
    }
    updates.updatedAt = new Date()

    if (Object.keys(updates).length === 0) {
      return reply.code(400).send({ error: 'No fields to update' })
    }

    const [updated] = await db.update(tasks).set(updates)
      .where(eq(tasks.id, existing.id))
      .returning()

    return updated
  })

  /**
   * DELETE /api/admin/tasks/:slug
   * Soft-delete (set status to 'archived').
   */
  app.delete('/api/admin/tasks/:slug', { preHandler: adminPreHandler }, async (request, reply) => {
    const { slug } = request.params

    const [existing] = await db.select().from(tasks)
      .where(eq(tasks.slug, slug)).limit(1)
    if (!existing) return reply.code(404).send({ error: 'Task not found' })

    await db.update(tasks).set({ status: 'archived', updatedAt: new Date() })
      .where(eq(tasks.id, existing.id))

    return { ok: true, slug, status: 'archived' }
  })

  // ─── Sub-task CRUD ────────────────────────────────────────────

  /**
   * GET /api/admin/tasks/:slug/subtasks
   * List all sub-tasks for a task.
   */
  app.get('/api/admin/tasks/:slug/subtasks', { preHandler: adminPreHandler }, async (request, reply) => {
    const { slug } = request.params

    const [task] = await db.select().from(tasks)
      .where(eq(tasks.slug, slug)).limit(1)
    if (!task) return reply.code(404).send({ error: 'Task not found' })

    const subs = await db.select().from(subTasks)
      .where(eq(subTasks.taskId, task.id))
      .orderBy(subTasks.orderIndex)

    return { items: subs, total: subs.length }
  })

  /**
   * POST /api/admin/tasks/:slug/subtasks
   * Add a sub-task to a task.
   */
  app.post('/api/admin/tasks/:slug/subtasks', { preHandler: adminPreHandler }, async (request, reply) => {
    const { slug } = request.params
    const body = request.body || {}

    const [task] = await db.select().from(tasks)
      .where(eq(tasks.slug, slug)).limit(1)
    if (!task) return reply.code(404).send({ error: 'Task not found' })

    const required = ['orderIndex', 'type', 'title', 'instruction']
    for (const field of required) {
      if (body[field] === undefined) return reply.code(400).send({ error: `Missing required field: ${field}` })
    }

    const [sub] = await db.insert(subTasks).values({
      taskId: task.id,
      orderIndex: body.orderIndex,
      type: body.type,
      title: body.title,
      instruction: body.instruction,
      locationName: body.locationName || null,
      locationAddress: body.locationAddress || null,
      locationLat: body.locationLat ? String(body.locationLat) : null,
      locationLng: body.locationLng ? String(body.locationLng) : null,
      validationConfig: body.validationConfig || null,
      hints: body.hints || null,
    }).returning()

    // Update totalSubTasks on the task
    await updateTaskSubTaskCount(task.id)

    return reply.code(201).send(sub)
  })

  /**
   * PUT /api/admin/tasks/:slug/subtasks/:id
   * Update a sub-task.
   */
  app.put('/api/admin/tasks/:slug/subtasks/:id', { preHandler: adminPreHandler }, async (request, reply) => {
    const { slug, id } = request.params
    const body = request.body || {}

    const [task] = await db.select().from(tasks)
      .where(eq(tasks.slug, slug)).limit(1)
    if (!task) return reply.code(404).send({ error: 'Task not found' })

    const [existing] = await db.select().from(subTasks)
      .where(and(eq(subTasks.id, id), eq(subTasks.taskId, task.id))).limit(1)
    if (!existing) return reply.code(404).send({ error: 'Sub-task not found' })

    const updates = {}
    const updatable = ['orderIndex', 'type', 'title', 'instruction', 'locationName',
      'locationAddress', 'locationLat', 'locationLng', 'validationConfig', 'hints']
    for (const key of updatable) {
      if (body[key] !== undefined) {
        updates[key] = key === 'locationLat' || key === 'locationLng'
          ? (body[key] ? String(body[key]) : null)
          : body[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return reply.code(400).send({ error: 'No fields to update' })
    }

    const [updated] = await db.update(subTasks).set(updates)
      .where(eq(subTasks.id, existing.id))
      .returning()

    return updated
  })

  /**
   * DELETE /api/admin/tasks/:slug/subtasks/:id
   * Delete a sub-task.
   */
  app.delete('/api/admin/tasks/:slug/subtasks/:id', { preHandler: adminPreHandler }, async (request, reply) => {
    const { slug, id } = request.params

    const [task] = await db.select().from(tasks)
      .where(eq(tasks.slug, slug)).limit(1)
    if (!task) return reply.code(404).send({ error: 'Task not found' })

    const [existing] = await db.select().from(subTasks)
      .where(and(eq(subTasks.id, id), eq(subTasks.taskId, task.id))).limit(1)
    if (!existing) return reply.code(404).send({ error: 'Sub-task not found' })

    await db.delete(subTasks).where(eq(subTasks.id, existing.id))

    await updateTaskSubTaskCount(task.id)

    return { ok: true }
  })

  // ─── Review workflow ─────────────────────────────────────────

  /**
   * GET /api/admin/reviews/pending
   * List tasks with status 'pending_review'.
   */
  app.get('/api/admin/reviews/pending', { preHandler: adminPreHandler }, async (request) => {
    const { page = '1', pageSize = '20' } = request.query
    const limit = Math.min(parseInt(pageSize, 10), 100)
    const offset = (parseInt(page, 10) - 1) * limit

    const [items, countResult] = await Promise.all([
      db.select().from(tasks)
        .where(eq(tasks.status, 'pending_review'))
        .orderBy(tasks.createdAt)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(tasks)
        .where(eq(tasks.status, 'pending_review')),
    ])

    // Get subtask counts
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
   * PUT /api/admin/reviews/:id
   * Approve or reject a pending task.
   * Body: { action: 'approved' | 'rejected', comment?: string }
   */
  app.put('/api/admin/reviews/:id', { preHandler: adminPreHandler }, async (request, reply) => {
    const { id } = request.params
    const body = request.body || {}

    if (!body.action || !['approved', 'rejected'].includes(body.action)) {
      return reply.code(400).send({ error: 'Action must be "approved" or "rejected"' })
    }

    const [task] = await db.select().from(tasks)
      .where(eq(tasks.id, id)).limit(1)
    if (!task) return reply.code(404).send({ error: 'Task not found' })
    if (task.status !== 'pending_review') {
      return reply.code(400).send({ error: `Task status is "${task.status}", not "pending_review"` })
    }

    const newStatus = body.action === 'approved' ? 'published' : 'rejected'

    // Update task status
    await db.update(tasks).set({ status: newStatus, updatedAt: new Date() })
      .where(eq(tasks.id, task.id))

    // Log review
    await db.insert(taskReviews).values({
      taskId: task.id,
      action: body.action,
      comment: body.comment || null,
    })

    return { ok: true, taskId: task.id, status: newStatus }
  })
}

/**
 * Recalculate and update totalSubTasks count on the tasks table.
 */
async function updateTaskSubTaskCount(taskId) {
  const [result] = await db.select({ count: sql`count(*)` })
    .from(subTasks)
    .where(eq(subTasks.taskId, taskId))

  // Note: totalSubTasks isn't a column in the schema — it's computed.
  // But the tasks schema doesn't have this field, so this is a no-op placeholder.
  // The count is computed at query time in getTaskBySlug.
}
