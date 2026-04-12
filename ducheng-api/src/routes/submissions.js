import { db } from '../db/client.js'
import { taskSubmissions, taskProgress, tasks } from '../db/schema.js'
import { eq, and, sql } from 'drizzle-orm'
import { authPreHandler } from '../middleware/auth.js'
import { getTaskBySlug, getSubTaskByIndex, getSubTasksForTask } from '../services/task-service.js'

export function registerSubmissionRoutes(app) {
  // POST /api/tasks/:slug/submit — submit current sub-task
  app.post('/api/tasks/:slug/submit', { preHandler: authPreHandler }, async (request, reply) => {
    const { slug } = request.params
    const userId = request.userId
    const body = request.body || {}

    const task = await getTaskBySlug(slug)
    if (!task) {
      return reply.code(404).send({ error: 'Task not found' })
    }

    // Get progress
    const [progress] = await db.select().from(taskProgress)
      .where(and(eq(taskProgress.userId, userId), eq(taskProgress.taskId, task.id)))
      .limit(1)

    if (!progress || progress.status !== 'in_progress') {
      return reply.code(400).send({ error: 'Task not in progress' })
    }

    // Get current sub-task
    const currentSubTask = await getSubTaskByIndex(task.id, progress.currentSubTaskIndex)
    if (!currentSubTask) {
      return reply.code(400).send({ error: 'No current sub-task' })
    }

    const subTaskType = currentSubTask.type

    // Phase 1A: Auto-approve all submissions
    // Phase 1B will add proper verification per type
    let submissionData = {
      userId,
      taskId: task.id,
      subTaskId: currentSubTask.id,
      status: 'approved',
      submittedAt: new Date(),
      verifiedAt: new Date(),
    }

    if (subTaskType === 'photo') {
      submissionData.photoUrl = body.photoUrl || null
    } else if (subTaskType === 'arrival') {
      submissionData.gpsLat = body.lat || null
      submissionData.gpsLng = body.lng || null
    } else if (subTaskType === 'puzzle' || subTaskType === 'quiz') {
      submissionData.answerText = body.answer || null
    }

    // Save submission
    await db.insert(taskSubmissions).values(submissionData)

    // Check if this was the last sub-task
    const allSubs = await getSubTasksForTask(task.id)
    const isLast = progress.currentSubTaskIndex >= allSubs.length

    if (isLast) {
      // Complete the task
      await db.update(taskProgress)
        .set({
          status: 'completed',
          currentSubTaskIndex: allSubs.length,
          completedAt: new Date(),
        })
        .where(eq(taskProgress.id, progress.id))

      // Increment task completion count
      await db.update(tasks)
        .set({ completionCount: sql`${tasks.completionCount} + 1` })
        .where(eq(tasks.id, task.id))

      return {
        approved: true,
        taskCompleted: true,
        message: 'Congratulations! Task completed!',
      }
    }

    // Advance to next sub-task
    const nextIndex = progress.currentSubTaskIndex + 1
    await db.update(taskProgress)
      .set({ currentSubTaskIndex: nextIndex })
      .where(eq(taskProgress.id, progress.id))

    const nextSubTask = await getSubTaskByIndex(task.id, nextIndex)

    return {
      approved: true,
      taskCompleted: false,
      nextSubTask,
    }
  })
}
