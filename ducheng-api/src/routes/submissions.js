import { db } from '../db/client.js'
import { tasks, taskSubmissions, taskProgress, subTasks, userBadges } from '../db/schema.js'
import { eq, and, sql, count } from 'drizzle-orm'
import { authPreHandler } from '../middleware/auth.js'
import { getTaskBySlug, getSubTaskByIndex, getSubTasksForTask } from '../services/task-service.js'
import { verifyPhoto } from '../services/verification/photo-verifier.js'
import { verifyArrival } from '../services/verification/arrival-verifier.js'
import { verifyPuzzle, verifyQuiz } from '../services/verification/puzzle-verifier.js'

/**
 * Count how many times a user has submitted (failed) for a specific sub-task.
 */
async function getAttemptCount(userId, subTaskId) {
  const [result] = await db
    .select({ count: count() })
    .from(taskSubmissions)
    .where(
      and(
        eq(taskSubmissions.userId, userId),
        eq(taskSubmissions.subTaskId, subTaskId),
        eq(taskSubmissions.status, 'rejected')
      )
    )
  return Number(result?.count ?? 0)
}

/**
 * Route verification to the correct service based on sub-task type.
 */
async function routeVerification(subTaskType, body, validationConfig) {
  switch (subTaskType) {
    case 'photo':
      return verifyPhoto(body.photoUrl, validationConfig)

    case 'arrival':
      return verifyArrival(
        { gpsLat: body.gpsLat, gpsLng: body.gpsLng },
        validationConfig
      )

    case 'puzzle':
      return verifyPuzzle(
        { answerText: body.answerText },
        validationConfig
      )

    case 'quiz':
      return verifyQuiz(
        { selectedIndex: body.selectedIndex },
        validationConfig
      )

    default:
      // Unknown type — auto-approve
      return { passed: true, reason: 'Unknown sub-task type (auto-approved)' }
  }
}

export function registerSubmissionRoutes(app) {
  /**
   * POST /api/tasks/:slug/submit
   *
   * Body (varies by sub-task type):
   *   photo:   { photoUrl: string }
   *   arrival: { gpsLat: number, gpsLng: number }
   *   puzzle:  { answerText: string }
   *   quiz:    { selectedIndex: number }
   *   any:     { skip?: boolean }  — skip after 3 failures
   */
  app.post('/api/tasks/:slug/submit', { preHandler: authPreHandler }, async (request, reply) => {
    const { slug } = request.params
    const userId = request.userId
    const body = request.body || {}

    // 1. Validate task exists
    const task = await getTaskBySlug(slug)
    if (!task) {
      return reply.code(404).send({ error: 'Task not found' })
    }

    // 2. Validate user has active progress
    const [progress] = await db
      .select()
      .from(taskProgress)
      .where(and(eq(taskProgress.userId, userId), eq(taskProgress.taskId, task.id)))
      .limit(1)

    if (!progress || progress.status !== 'in_progress') {
      return reply.code(400).send({ error: 'Task not in progress' })
    }

    // 3. Get current sub-task
    const currentSubTask = await getSubTaskByIndex(task.id, progress.currentSubTaskIndex)
    if (!currentSubTask) {
      return reply.code(400).send({ error: 'No current sub-task found' })
    }

    // 4. Optional: validate sub_task_id matches if provided
    if (body.subTaskId && body.subTaskId !== currentSubTask.id) {
      return reply.code(400).send({ error: 'sub_task_id does not match current sub-task' })
    }

    const validationConfig = currentSubTask.validationConfig || {}
    const subTaskType = currentSubTask.type

    // 5. Handle skip request (after 3 failed attempts)
    if (body.skip === true) {
      const failedAttempts = await getAttemptCount(userId, currentSubTask.id)
      if (failedAttempts < 3) {
        return reply.code(400).send({
          error: 'Cannot skip yet',
          failedAttempts,
          requiredAttempts: 3,
        })
      }

      // Record skip as an approved submission
      await db.insert(taskSubmissions).values({
        userId,
        taskId: task.id,
        subTaskId: currentSubTask.id,
        status: 'approved',
        aiResult: { skipped: true, reason: `Skipped after ${failedAttempts} failed attempts` },
        submittedAt: new Date(),
        verifiedAt: new Date(),
      })

      // Advance (shared logic below)
      return await advanceProgress(task, progress, currentSubTask, userId, reply)
    }

    // 6. Run verification
    const verificationResult = await routeVerification(subTaskType, body, validationConfig)

    // 7. Build submission record
    const submissionData = {
      userId,
      taskId: task.id,
      subTaskId: currentSubTask.id,
      status: verificationResult.passed ? 'approved' : 'rejected',
      photoUrl: subTaskType === 'photo' ? (body.photoUrl || null) : null,
      answerText: (subTaskType === 'puzzle' || subTaskType === 'quiz')
        ? (body.answerText || String(body.selectedIndex ?? ''))
        : null,
      gpsLat: subTaskType === 'arrival' ? (body.gpsLat || null) : null,
      gpsLng: subTaskType === 'arrival' ? (body.gpsLng || null) : null,
      aiResult: verificationResult,
      aiConfidence: typeof verificationResult.confidence === 'number'
        ? String(verificationResult.confidence)
        : null,
      submittedAt: new Date(),
      verifiedAt: new Date(),
    }

    await db.insert(taskSubmissions).values(submissionData)

    // 8. If rejected — return failure with attempt count
    if (!verificationResult.passed) {
      const failedAttempts = await getAttemptCount(userId, currentSubTask.id)

      return {
        approved: false,
        reason: verificationResult.reason || 'Verification failed',
        failedAttempts,
        canSkip: failedAttempts >= 3,
      }
    }

    // 9. Approved — advance progress
    return await advanceProgress(task, progress, currentSubTask, userId, reply)
  })
}

/**
 * Advance the user's progress after a successful submission.
 * Handles both mid-task advancement and task completion.
 */
async function advanceProgress(task, progress, currentSubTask, userId, reply) {
  const allSubs = await getSubTasksForTask(task.id)
  const isLast = progress.currentSubTaskIndex >= allSubs.length

  if (isLast) {
    // === Task completed ===

    // Calculate completion rank (atomic: count existing + 1)
    const [rankResult] = await db
      .select({ count: count() })
      .from(taskProgress)
      .where(
        and(
          eq(taskProgress.taskId, task.id),
          eq(taskProgress.status, 'completed')
        )
      )
    const completionRank = Number(rankResult?.count ?? 0) + 1

    // Mark progress as completed
    await db
      .update(taskProgress)
      .set({
        status: 'completed',
        completedAt: new Date(),
        completionRank,
      })
      .where(eq(taskProgress.id, progress.id))

    // Increment task completion count
    await db
      .update(tasks)
      .set({ completionCount: sql`${tasks.completionCount} + 1` })
      .where(eq(tasks.id, task.id))

    // Award badge (idempotent — check first)
    const [existingBadge] = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.taskId, task.id)))
      .limit(1)

    if (!existingBadge) {
      await db.insert(userBadges).values({
        userId,
        taskId: task.id,
        unlockedAt: new Date(),
      })
    }

    return {
      approved: true,
      taskCompleted: true,
      completionRank,
      badge: {
        name: task.badgeName,
        icon: task.badgeIcon,
        color: task.badgeColor,
      },
      message: `Congratulations! You are #${completionRank} to complete this task!`,
    }
  }

  // === Advance to next sub-task ===
  const nextIndex = progress.currentSubTaskIndex + 1

  await db
    .update(taskProgress)
    .set({ currentSubTaskIndex: nextIndex })
    .where(eq(taskProgress.id, progress.id))

  const nextSubTask = await getSubTaskByIndex(task.id, nextIndex)

  return {
    approved: true,
    taskCompleted: false,
    nextSubTask,
  }
}
