import { db } from '../db/client.js'
import { userPosters, taskSubmissions, taskProgress, tasks, subTasks } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { authPreHandler } from '../middleware/auth.js'
import { getTaskBySlug } from '../services/task-service.js'

export function registerPosterRoutes(app) {
  /**
   * GET /api/tasks/:slug/poster
   * Returns poster data for a completed task.
   * If no poster record exists yet, generates data from submissions.
   *
   * Note: Actual image generation (HTML-to-image) is deferred to a later phase.
   * For now, this returns structured data the frontend can render client-side.
   */
  app.get('/api/tasks/:slug/poster', { preHandler: authPreHandler }, async (request, reply) => {
    const { slug } = request.params
    const userId = request.userId

    const task = await getTaskBySlug(slug)
    if (!task) {
      return reply.code(404).send({ error: 'Task not found' })
    }

    // Check completion
    const [progress] = await db
      .select()
      .from(taskProgress)
      .where(
        and(
          eq(taskProgress.userId, userId),
          eq(taskProgress.taskId, task.id),
          eq(taskProgress.status, 'completed')
        )
      )
      .limit(1)

    if (!progress) {
      return reply.code(403).send({ error: 'Task not completed yet' })
    }

    // Check if poster already exists
    const [existingPoster] = await db
      .select()
      .from(userPosters)
      .where(and(eq(userPosters.userId, userId), eq(userPosters.taskId, task.id)))
      .limit(1)

    if (existingPoster) {
      return {
        poster: existingPoster,
        task: buildTaskSummary(task, progress),
      }
    }

    // Generate poster data from approved photo submissions
    const photoSubmissions = await db
      .select({
        photoUrl: taskSubmissions.photoUrl,
        orderIndex: subTasks.orderIndex,
        locationName: subTasks.locationName,
      })
      .from(taskSubmissions)
      .innerJoin(subTasks, eq(taskSubmissions.subTaskId, subTasks.id))
      .where(
        and(
          eq(taskSubmissions.userId, userId),
          eq(taskSubmissions.taskId, task.id),
          eq(taskSubmissions.status, 'approved')
        )
      )
      .orderBy(subTasks.orderIndex)

    // Filter to only photo-type submissions with URLs
    const photos = photoSubmissions
      .filter((s) => s.photoUrl)
      .map((s) => ({
        url: s.photoUrl,
        locationName: s.locationName,
        orderIndex: s.orderIndex,
      }))

    // Save poster record (without image_url — client-side rendering for now)
    const [poster] = await db
      .insert(userPosters)
      .values({
        userId,
        taskId: task.id,
        imageUrl: null, // Will be populated when server-side generation is implemented
        photos: photos,
        createdAt: new Date(),
      })
      .returning()

    return {
      poster,
      task: buildTaskSummary(task, progress),
    }
  })
}

function buildTaskSummary(task, progress) {
  const durationMs = progress.completedAt && progress.startedAt
    ? new Date(progress.completedAt).getTime() - new Date(progress.startedAt).getTime()
    : null

  return {
    title: task.title,
    slug: task.slug,
    city: task.city,
    locationSummary: task.locationSummary,
    totalSubTasks: task.totalSubTasks,
    badge: {
      name: task.badgeName,
      icon: task.badgeIcon,
      color: task.badgeColor,
    },
    completionRank: progress.completionRank,
    durationMinutes: durationMs ? Math.round(durationMs / 60000) : null,
    completedAt: progress.completedAt,
  }
}
