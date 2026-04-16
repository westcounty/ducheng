import { db } from '../db/client.js'
import { taskProgress, tasks } from '../db/schema.js'
import { eq, and, sql, count, desc, asc } from 'drizzle-orm'

export function registerLeaderboardRoutes(app) {
  /**
   * GET /api/leaderboard/:slug
   * Fastest completions for a specific task.
   */
  app.get('/api/leaderboard/:slug', async (request, reply) => {
    const { slug } = request.params
    const { limit = '50' } = request.query

    const [task] = await db.select().from(tasks)
      .where(eq(tasks.slug, slug)).limit(1)
    if (!task) return reply.code(404).send({ error: 'Task not found' })

    const maxResults = Math.min(parseInt(limit, 10), 100)

    const results = await db.select({
      userId: taskProgress.userId,
      durationMs: sql`EXTRACT(EPOCH FROM (${taskProgress.completedAt} - ${taskProgress.startedAt})) * 1000`,
      completedAt: taskProgress.completedAt,
      rank: taskProgress.completionRank,
    }).from(taskProgress)
      .where(and(
        eq(taskProgress.taskId, task.id),
        eq(taskProgress.status, 'completed'),
      ))
      .orderBy(sql`(${taskProgress.completedAt} - ${taskProgress.startedAt}) ASC`)
      .limit(maxResults)

    return {
      task: { slug: task.slug, title: task.title },
      entries: results.map((r, i) => ({
        rank: r.rank || (i + 1),
        userId: maskUserId(r.userId),
        durationMinutes: Math.round(Number(r.durationMs) / 60000),
        completedAt: r.completedAt,
      })),
    }
  })

  /**
   * GET /api/leaderboard/global
   * Global ranking: users by total completed tasks.
   */
  app.get('/api/leaderboard/global', async (request) => {
    const { limit = '50' } = request.query
    const maxResults = Math.min(parseInt(limit, 10), 100)

    const results = await db.select({
      userId: taskProgress.userId,
      completedCount: count(),
    }).from(taskProgress)
      .where(eq(taskProgress.status, 'completed'))
      .groupBy(taskProgress.userId)
      .orderBy(desc(count()))
      .limit(maxResults)

    return {
      entries: results.map((r, i) => ({
        rank: i + 1,
        userId: maskUserId(r.userId),
        completedTasks: Number(r.completedCount),
      })),
    }
  })
}

function maskUserId(id) {
  if (!id) return '-'
  const s = String(id)
  if (s.length <= 8) return s.slice(0, 3) + '***'
  return s.slice(0, 4) + '***' + s.slice(-3)
}
