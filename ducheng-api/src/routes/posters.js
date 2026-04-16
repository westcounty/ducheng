import { db } from '../db/client.js'
import { userPosters, taskSubmissions, taskProgress, tasks, subTasks } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { authPreHandler } from '../middleware/auth.js'
import { getTaskBySlug } from '../services/task-service.js'
import { generatePoster } from '../services/poster-generator.js'

export function registerPosterRoutes(app) {
  /**
   * GET /api/tasks/:slug/poster
   * Returns poster data for a completed task.
   * If no poster record exists yet, generates the poster image (via Puppeteer)
   * and saves it to uploads/posters/.
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

    // Calculate duration for poster
    const durationMs = progress.completedAt && progress.startedAt
      ? new Date(progress.completedAt).getTime() - new Date(progress.startedAt).getTime()
      : null
    const durationMinutes = durationMs ? Math.round(durationMs / 60000) : null

    // Generate poster image (Puppeteer-based, returns null if unavailable)
    let imageUrl = null
    try {
      imageUrl = await generatePoster({
        taskTitle: task.title,
        city: task.city,
        location: task.locationSummary,
        photos: photos.map(p => p.url),
        rank: progress.completionRank,
        steps: task.totalSubTasks,
        duration: durationMinutes,
        badgeIcon: task.badgeIcon,
        badgeName: task.badgeName,
        badgeColor: task.badgeColor,
      })
    } catch (err) {
      console.error('Poster image generation error:', err.message)
    }

    // Save poster record
    const [poster] = await db
      .insert(userPosters)
      .values({
        userId,
        taskId: task.id,
        imageUrl,
        photos: photos,
        createdAt: new Date(),
      })
      .returning()

    return {
      poster,
      task: buildTaskSummary(task, progress),
    }
  })

  /**
   * POST /api/tasks/:slug/poster/regenerate
   * Regenerates the poster image (e.g. if Puppeteer was unavailable on first attempt).
   */
  app.post('/api/tasks/:slug/poster/regenerate', { preHandler: authPreHandler }, async (request, reply) => {
    const { slug } = request.params
    const userId = request.userId

    const task = await getTaskBySlug(slug)
    if (!task) {
      return reply.code(404).send({ error: 'Task not found' })
    }

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

    // Get existing poster record
    const [existingPoster] = await db
      .select()
      .from(userPosters)
      .where(and(eq(userPosters.userId, userId), eq(userPosters.taskId, task.id)))
      .limit(1)

    const durationMs = progress.completedAt && progress.startedAt
      ? new Date(progress.completedAt).getTime() - new Date(progress.startedAt).getTime()
      : null
    const durationMinutes = durationMs ? Math.round(durationMs / 60000) : null

    // Generate new poster image
    let imageUrl = null
    try {
      imageUrl = await generatePoster({
        taskTitle: task.title,
        city: task.city,
        location: task.locationSummary,
        photos: (existingPoster?.photos || []).map(p => p.url || p),
        rank: progress.completionRank,
        steps: task.totalSubTasks,
        duration: durationMinutes,
        badgeIcon: task.badgeIcon,
        badgeName: task.badgeName,
        badgeColor: task.badgeColor,
      })
    } catch (err) {
      console.error('Poster regeneration error:', err.message)
    }

    if (existingPoster) {
      // Update existing record
      await db
        .update(userPosters)
        .set({ imageUrl })
        .where(eq(userPosters.id, existingPoster.id))

      existingPoster.imageUrl = imageUrl
      return {
        poster: { ...existingPoster, imageUrl },
        task: buildTaskSummary(task, progress),
      }
    }

    return reply.code(404).send({ error: 'No poster record found. Fetch poster first via GET.' })
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
