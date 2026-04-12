import { db } from '../db/client.js'
import { taskProgress, taskSubmissions, userBadges, tasks } from '../db/schema.js'
import { eq, and, count, sql } from 'drizzle-orm'
import { authPreHandler } from '../middleware/auth.js'

export function registerUserRoutes(app) {
  /**
   * GET /api/me
   * Returns user info extracted from JWT payload.
   */
  app.get('/api/me', { preHandler: authPreHandler }, async (request) => {
    return {
      userId: request.userId,
    }
  })

  /**
   * GET /api/me/stats
   * Returns aggregated stats for the authenticated user.
   */
  app.get('/api/me/stats', { preHandler: authPreHandler }, async (request) => {
    const userId = request.userId

    const [completedResult] = await db
      .select({ count: count() })
      .from(taskProgress)
      .where(
        and(
          eq(taskProgress.userId, userId),
          eq(taskProgress.status, 'completed')
        )
      )

    const [inProgressResult] = await db
      .select({ count: count() })
      .from(taskProgress)
      .where(
        and(
          eq(taskProgress.userId, userId),
          eq(taskProgress.status, 'in_progress')
        )
      )

    const [photosResult] = await db
      .select({ count: count() })
      .from(taskSubmissions)
      .where(
        and(
          eq(taskSubmissions.userId, userId),
          eq(taskSubmissions.status, 'approved'),
          sql`${taskSubmissions.photoUrl} IS NOT NULL`
        )
      )

    const [badgesResult] = await db
      .select({ count: count() })
      .from(userBadges)
      .where(eq(userBadges.userId, userId))

    return {
      completedTasks: Number(completedResult?.count ?? 0),
      inProgressTasks: Number(inProgressResult?.count ?? 0),
      totalPhotos: Number(photosResult?.count ?? 0),
      totalBadges: Number(badgesResult?.count ?? 0),
    }
  })

  /**
   * GET /api/me/history
   * Returns completed tasks with timestamps, rank, and badge info.
   */
  app.get('/api/me/history', { preHandler: authPreHandler }, async (request) => {
    const userId = request.userId

    const completedProgress = await db
      .select({
        taskId: taskProgress.taskId,
        startedAt: taskProgress.startedAt,
        completedAt: taskProgress.completedAt,
        completionRank: taskProgress.completionRank,
        taskTitle: tasks.title,
        taskSlug: tasks.slug,
        taskCity: tasks.city,
        taskCoverImage: tasks.coverImage,
        badgeName: tasks.badgeName,
        badgeIcon: tasks.badgeIcon,
        badgeColor: tasks.badgeColor,
      })
      .from(taskProgress)
      .innerJoin(tasks, eq(taskProgress.taskId, tasks.id))
      .where(
        and(
          eq(taskProgress.userId, userId),
          eq(taskProgress.status, 'completed')
        )
      )
      .orderBy(sql`${taskProgress.completedAt} DESC`)

    const history = completedProgress.map((row) => {
      const durationMs = row.completedAt && row.startedAt
        ? new Date(row.completedAt).getTime() - new Date(row.startedAt).getTime()
        : null

      return {
        taskId: row.taskId,
        taskSlug: row.taskSlug,
        taskTitle: row.taskTitle,
        city: row.taskCity,
        coverImage: row.taskCoverImage,
        completionRank: row.completionRank,
        durationMinutes: durationMs ? Math.round(durationMs / 60000) : null,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        badge: {
          name: row.badgeName,
          icon: row.badgeIcon,
          color: row.badgeColor,
        },
      }
    })

    return { history, total: history.length }
  })
}
