import { db } from '../db/client.js'
import { userBadges, tasks } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { authPreHandler } from '../middleware/auth.js'

export function registerBadgeRoutes(app) {
  /**
   * GET /api/badges
   * Returns all tasks with badge info, marking which ones the user has unlocked.
   */
  app.get('/api/badges', { preHandler: authPreHandler }, async (request) => {
    const userId = request.userId

    // Get all published tasks (they all have potential badges)
    const allTasks = await db
      .select({
        id: tasks.id,
        slug: tasks.slug,
        title: tasks.title,
        badgeName: tasks.badgeName,
        badgeIcon: tasks.badgeIcon,
        badgeColor: tasks.badgeColor,
        city: tasks.city,
      })
      .from(tasks)
      .where(eq(tasks.status, 'published'))
      .orderBy(tasks.createdAt)

    // Get user's unlocked badges
    const unlocked = await db
      .select({
        taskId: userBadges.taskId,
        unlockedAt: userBadges.unlockedAt,
      })
      .from(userBadges)
      .where(eq(userBadges.userId, userId))

    const unlockedMap = new Map(unlocked.map((b) => [b.taskId, b.unlockedAt]))

    const badges = allTasks.map((task) => {
      const unlockedAt = unlockedMap.get(task.id)
      return {
        taskId: task.id,
        taskSlug: task.slug,
        taskTitle: task.title,
        name: task.badgeName,
        icon: task.badgeIcon,
        color: task.badgeColor,
        city: task.city,
        unlocked: !!unlockedAt,
        unlockedAt: unlockedAt || null,
      }
    })

    return {
      badges,
      totalUnlocked: unlocked.length,
      totalAvailable: allTasks.length,
    }
  })
}
