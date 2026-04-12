import { db } from '../db/client.js'
import { taskProgress } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { authPreHandler } from '../middleware/auth.js'
import { getTaskBySlug, getSubTaskByIndex, getSubTasksForTask } from '../services/task-service.js'

export function registerProgressRoutes(app) {
  // POST /api/tasks/:slug/start — create progress, return first sub-task
  app.post('/api/tasks/:slug/start', { preHandler: authPreHandler }, async (request, reply) => {
    const { slug } = request.params
    const userId = request.userId
    const task = await getTaskBySlug(slug)

    if (!task) {
      return reply.code(404).send({ error: 'Task not found' })
    }

    // Check if already started
    const [existing] = await db.select().from(taskProgress)
      .where(and(eq(taskProgress.userId, userId), eq(taskProgress.taskId, task.id)))
      .limit(1)

    if (existing) {
      // Already started — return current state
      return reply.code(409).send({
        error: 'Task already started',
        progress: existing,
      })
    }

    // Create new progress
    const [progress] = await db.insert(taskProgress).values({
      userId,
      taskId: task.id,
      currentSubTaskIndex: 1,
      status: 'in_progress',
      startedAt: new Date(),
    }).returning()

    // Get first sub-task
    const firstSubTask = await getSubTaskByIndex(task.id, 1)

    return {
      progress: {
        id: progress.id,
        status: progress.status,
        currentSubTaskIndex: progress.currentSubTaskIndex,
        startedAt: progress.startedAt,
      },
      currentSubTask: firstSubTask,
    }
  })

  // GET /api/tasks/:slug/progress — get current progress + current sub-task
  app.get('/api/tasks/:slug/progress', { preHandler: authPreHandler }, async (request, reply) => {
    const { slug } = request.params
    const userId = request.userId
    const task = await getTaskBySlug(slug)

    if (!task) {
      return reply.code(404).send({ error: 'Task not found' })
    }

    const [progress] = await db.select().from(taskProgress)
      .where(and(eq(taskProgress.userId, userId), eq(taskProgress.taskId, task.id)))
      .limit(1)

    if (!progress) {
      return reply.code(404).send({ error: 'Task not started' })
    }

    if (progress.status === 'completed') {
      return {
        progress: {
          id: progress.id,
          status: progress.status,
          currentSubTaskIndex: progress.currentSubTaskIndex,
          startedAt: progress.startedAt,
          completedAt: progress.completedAt,
          completionRank: progress.completionRank,
        },
        completed: true,
      }
    }

    // Get current sub-task
    const currentSubTask = await getSubTaskByIndex(task.id, progress.currentSubTaskIndex)
    const allSubs = await getSubTasksForTask(task.id)

    return {
      progress: {
        id: progress.id,
        status: progress.status,
        currentSubTaskIndex: progress.currentSubTaskIndex,
        startedAt: progress.startedAt,
      },
      currentSubTask,
      totalSubTasks: allSubs.length,
    }
  })
}
