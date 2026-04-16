import { db } from '../db/client.js'
import { taskRatings, taskProgress, tasks } from '../db/schema.js'
import { eq, and, sql } from 'drizzle-orm'
import { authPreHandler } from '../middleware/auth.js'
import { getTaskBySlug } from '../services/task-service.js'

export function registerRatingRoutes(app) {
  /**
   * POST /api/tasks/:slug/rate
   * Rate a task (1-5). User must have completed the task.
   */
  app.post('/api/tasks/:slug/rate', { preHandler: authPreHandler }, async (request, reply) => {
    const { slug } = request.params
    const userId = request.userId
    const body = request.body || {}

    const rating = parseInt(body.rating, 10)
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return reply.code(400).send({ error: 'Rating must be 1-5' })
    }

    const task = await getTaskBySlug(slug)
    if (!task) return reply.code(404).send({ error: 'Task not found' })

    // Check user completed the task
    const [progress] = await db.select().from(taskProgress)
      .where(and(
        eq(taskProgress.userId, userId),
        eq(taskProgress.taskId, task.id),
        eq(taskProgress.status, 'completed'),
      ))
      .limit(1)

    if (!progress) {
      return reply.code(403).send({ error: 'You must complete this task before rating' })
    }

    // Upsert rating
    const [existing] = await db.select().from(taskRatings)
      .where(and(
        eq(taskRatings.taskId, task.id),
        eq(taskRatings.userId, userId),
      ))
      .limit(1)

    if (existing) {
      await db.update(taskRatings).set({ rating })
        .where(eq(taskRatings.id, existing.id))
    } else {
      await db.insert(taskRatings).values({
        taskId: task.id,
        userId,
        rating,
      })
    }

    // Recalculate average rating
    await recalcRating(task.id)

    // Fetch updated task
    const [updated] = await db.select({
      avgRating: tasks.avgRating,
      ratingCount: tasks.ratingCount,
    }).from(tasks).where(eq(tasks.id, task.id)).limit(1)

    return {
      rating,
      avgRating: updated.avgRating,
      ratingCount: updated.ratingCount,
    }
  })
}

async function recalcRating(taskId) {
  await db.update(tasks).set({
    avgRating: sql`(
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM task_ratings
      WHERE task_id = ${taskId}
    )`,
    ratingCount: sql`(
      SELECT COUNT(*)
      FROM task_ratings
      WHERE task_id = ${taskId}
    )`,
  }).where(eq(tasks.id, taskId))
}
