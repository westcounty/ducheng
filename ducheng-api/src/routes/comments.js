import { db } from '../db/client.js'
import { taskComments, tasks } from '../db/schema.js'
import { eq, count, desc } from 'drizzle-orm'
import { authPreHandler } from '../middleware/auth.js'
import { getTaskBySlug } from '../services/task-service.js'

export function registerCommentRoutes(app) {
  /**
   * GET /api/tasks/:slug/comments
   * List comments for a task (public).
   */
  app.get('/api/tasks/:slug/comments', async (request, reply) => {
    const { slug } = request.params
    const { page = '1', pageSize = '20' } = request.query

    const task = await getTaskBySlug(slug)
    if (!task) return reply.code(404).send({ error: 'Task not found' })

    const limit = Math.min(parseInt(pageSize, 10), 100)
    const offset = (parseInt(page, 10) - 1) * limit

    const [items, countResult] = await Promise.all([
      db.select().from(taskComments)
        .where(eq(taskComments.taskId, task.id))
        .orderBy(desc(taskComments.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(taskComments)
        .where(eq(taskComments.taskId, task.id)),
    ])

    return {
      items: items.map(c => ({
        id: c.id,
        userId: maskUserId(c.userId),
        content: c.content,
        createdAt: c.createdAt,
      })),
      total: Number(countResult[0]?.count ?? 0),
      page: parseInt(page, 10),
      pageSize: limit,
    }
  })

  /**
   * POST /api/tasks/:slug/comments
   * Add a comment (requires auth).
   */
  app.post('/api/tasks/:slug/comments', { preHandler: authPreHandler }, async (request, reply) => {
    const { slug } = request.params
    const userId = request.userId
    const body = request.body || {}

    if (!body.content || typeof body.content !== 'string') {
      return reply.code(400).send({ error: 'Content is required' })
    }
    const content = body.content.trim()
    if (content.length === 0 || content.length > 500) {
      return reply.code(400).send({ error: 'Content must be 1-500 characters' })
    }

    const task = await getTaskBySlug(slug)
    if (!task) return reply.code(404).send({ error: 'Task not found' })

    const [comment] = await db.insert(taskComments).values({
      taskId: task.id,
      userId,
      content,
    }).returning()

    return reply.code(201).send({
      id: comment.id,
      userId: maskUserId(comment.userId),
      content: comment.content,
      createdAt: comment.createdAt,
    })
  })
}

function maskUserId(id) {
  if (!id) return '-'
  const s = String(id)
  if (s.length <= 8) return s.slice(0, 3) + '***'
  return s.slice(0, 4) + '***' + s.slice(-3)
}
