# Exploration Task System — Phase 1B: Verification & Submission Backend

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the actual verification logic for all sub-task types (photo/AI, GPS arrival, puzzle, quiz), flesh out the submission handler to use them, and add badge, poster, and user profile routes — completing the backend MVP.

**Architecture:** Three verification services dispatched by sub-task type. GLM-4V API for photo verification with graceful degradation. Haversine formula for GPS distance. Case-insensitive matching for puzzles. All wired through the existing `POST /tasks/:slug/submit` route from Phase 1A.

**Tech Stack:** Node.js ESM, Fastify, Drizzle ORM, node-postgres, jsonwebtoken (all from Phase 1A). No new dependencies needed — GLM API called via native `fetch`.

**Pre-requisites:** Phase 1A must be completed (server running on port 3100, DB schema pushed, auth middleware working, all Phase 1A routes functional).

---

## File Structure

```
ducheng-api/src/
├── config.js                              # MODIFY — add GLM config fields
├── routes/
│   ├── submissions.js                     # MODIFY — replace auto-approve with real verification
│   ├── badges.js                          # NEW — GET /api/badges
│   ├── posters.js                         # NEW — GET /api/tasks/:slug/poster
│   └── me.js                              # NEW — GET /api/me, /api/me/stats, /api/me/history
├── services/
│   └── verification/
│       ├── photo-verifier.js              # NEW — GLM-4V photo verification
│       ├── arrival-verifier.js            # NEW — Haversine GPS verification
│       └── puzzle-verifier.js             # NEW — puzzle + quiz answer matching
└── index.js                               # MODIFY — register new route modules
```

---

### Task 1: Config — Add GLM Settings

**Files:** `ducheng-api/src/config.js`

- [ ] **Step 1: Add GLM config fields**

Edit `ducheng-api/src/config.js` to add the GLM settings at the end of the config object:

```javascript
import 'dotenv/config'

export const config = {
  port: parseInt(process.env.PORT || '3100', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.TUCHAN_JWT_SECRET,
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // GLM-4V API (智谱 multi-modal)
  glmApiKey: process.env.GLM_API_KEY || '',
  glmApiBaseUrl: process.env.GLM_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
  glmModel: process.env.GLM_MODEL || 'glm-4v-plus',
}
```

- [ ] **Step 2: Add GLM_API_KEY placeholder to .env**

Append to `ducheng-api/.env`:

```bash
# GLM API (智谱多模态 — Phase 1B photo verification)
GLM_API_KEY=your-glm-api-key-here
GLM_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
GLM_MODEL=glm-4v-plus
```

- [ ] **Step 3: Verify config loads**

```bash
cd ducheng-api && node -e "import('./src/config.js').then(m => console.log('GLM base:', m.config.glmApiBaseUrl, '| model:', m.config.glmModel))"
```

Expected: `GLM base: https://open.bigmodel.cn/api/paas/v4 | model: glm-4v-plus`

- [ ] **Step 4: Commit**

```bash
git add ducheng-api/src/config.js
git commit -m "feat(ducheng-api): add GLM API config for photo verification"
```

---

### Task 2: Arrival Verifier — Haversine GPS

**Files:** Create `ducheng-api/src/services/verification/arrival-verifier.js`

- [ ] **Step 1: Create the arrival verifier**

Create `ducheng-api/src/services/verification/arrival-verifier.js`:

```javascript
/**
 * Arrival verification using Haversine distance formula.
 * Compares user GPS coordinates against target location.
 */

const EARTH_RADIUS_METERS = 6_371_000

/**
 * Calculate the Haversine distance between two GPS points.
 * @param {number} lat1 - User latitude (degrees)
 * @param {number} lng1 - User longitude (degrees)
 * @param {number} lat2 - Target latitude (degrees)
 * @param {number} lng2 - Target longitude (degrees)
 * @returns {number} Distance in meters
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_METERS * c
}

/**
 * Verify that user GPS is within radius of the target location.
 *
 * @param {{ gpsLat: number, gpsLng: number }} submission - User's GPS coordinates
 * @param {{ lat: number, lng: number, radius_meters: number }} validationConfig - Target config
 * @returns {{ passed: boolean, distance: number, radius: number }}
 */
export function verifyArrival(submission, validationConfig) {
  const userLat = parseFloat(submission.gpsLat)
  const userLng = parseFloat(submission.gpsLng)
  const targetLat = parseFloat(validationConfig.lat)
  const targetLng = parseFloat(validationConfig.lng)
  const radius = validationConfig.radius_meters || 50

  if (isNaN(userLat) || isNaN(userLng)) {
    return { passed: false, distance: null, radius, reason: 'Invalid GPS coordinates' }
  }

  if (isNaN(targetLat) || isNaN(targetLng)) {
    // Config error — let user through (graceful degradation)
    return { passed: true, distance: 0, radius, reason: 'Target GPS not configured' }
  }

  const distance = Math.round(haversineDistance(userLat, userLng, targetLat, targetLng))

  return {
    passed: distance <= radius,
    distance,
    radius,
    reason: distance <= radius
      ? `Within range (${distance}m / ${radius}m)`
      : `Too far (${distance}m, need ≤${radius}m)`,
  }
}
```

- [ ] **Step 2: Quick smoke test**

```bash
cd ducheng-api && node -e "
import { verifyArrival } from './src/services/verification/arrival-verifier.js'

// ~0m apart
const r1 = verifyArrival({ gpsLat: 31.2064, gpsLng: 121.4384 }, { lat: 31.2064, lng: 121.4384, radius_meters: 50 })
console.log('Same point:', r1)

// ~1.1km apart (Bund to Nanjing Road)
const r2 = verifyArrival({ gpsLat: 31.2400, gpsLng: 121.4900 }, { lat: 31.2300, lng: 121.4800, radius_meters: 50 })
console.log('Far apart:', r2)
"
```

Expected: First passes (distance ~0), second fails (distance > 50).

- [ ] **Step 3: Commit**

```bash
git add ducheng-api/src/services/verification/arrival-verifier.js
git commit -m "feat(ducheng-api): Haversine GPS arrival verifier"
```

---

### Task 3: Puzzle & Quiz Verifier

**Files:** Create `ducheng-api/src/services/verification/puzzle-verifier.js`

- [ ] **Step 1: Create the puzzle/quiz verifier**

Create `ducheng-api/src/services/verification/puzzle-verifier.js`:

```javascript
/**
 * Puzzle and quiz answer verification.
 * - Puzzle: case-insensitive text match against answer + variants
 * - Quiz: index match against correct_index
 */

/**
 * Normalize text for comparison: trim, lowercase, collapse whitespace,
 * remove common punctuation.
 */
function normalize(text) {
  if (typeof text !== 'string') return ''
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.,;:!?。，；：！？、\-—–_'"'""\s]/g, '')
}

/**
 * Verify a puzzle answer against the correct answer and variants.
 *
 * @param {{ answerText: string }} submission - User's answer
 * @param {{ answer: string, answer_variants?: string[], answer_type?: string }} validationConfig
 * @returns {{ passed: boolean, correct: boolean, reason: string }}
 */
export function verifyPuzzle(submission, validationConfig) {
  const userAnswer = normalize(submission.answerText)

  if (!userAnswer) {
    return { passed: false, correct: false, reason: 'No answer provided' }
  }

  const correctAnswer = normalize(validationConfig.answer || '')
  const variants = (validationConfig.answer_variants || []).map(normalize)

  // Check main answer
  if (userAnswer === correctAnswer) {
    return { passed: true, correct: true, reason: 'Correct answer' }
  }

  // Check variants
  for (const variant of variants) {
    if (variant && userAnswer === variant) {
      return { passed: true, correct: true, reason: 'Correct (variant match)' }
    }
  }

  // Check if user answer contains the correct answer or vice versa
  // This handles cases like user typing "武康路2100号" when answer is "2100号"
  if (correctAnswer && (userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer))) {
    return { passed: true, correct: true, reason: 'Correct (partial match)' }
  }

  for (const variant of variants) {
    if (variant && (userAnswer.includes(variant) || variant.includes(userAnswer))) {
      return { passed: true, correct: true, reason: 'Correct (partial variant match)' }
    }
  }

  return { passed: false, correct: false, reason: 'Incorrect answer' }
}

/**
 * Verify a quiz selection against the correct index.
 *
 * @param {{ selectedIndex: number }} submission - User's selection (0-based index)
 * @param {{ correct_index: number, options: string[] }} validationConfig
 * @returns {{ passed: boolean, correct: boolean, reason: string }}
 */
export function verifyQuiz(submission, validationConfig) {
  const selectedIndex = parseInt(submission.selectedIndex, 10)

  if (isNaN(selectedIndex)) {
    return { passed: false, correct: false, reason: 'No selection provided' }
  }

  const correctIndex = validationConfig.correct_index
  const options = validationConfig.options || []

  if (selectedIndex < 0 || selectedIndex >= options.length) {
    return { passed: false, correct: false, reason: 'Invalid selection index' }
  }

  const isCorrect = selectedIndex === correctIndex

  return {
    passed: isCorrect,
    correct: isCorrect,
    reason: isCorrect
      ? 'Correct answer'
      : `Incorrect — selected "${options[selectedIndex]}"`,
  }
}
```

- [ ] **Step 2: Quick smoke test**

```bash
cd ducheng-api && node -e "
import { verifyPuzzle, verifyQuiz } from './src/services/verification/puzzle-verifier.js'

// Exact match
console.log('Exact:', verifyPuzzle({ answerText: '武康路2100号' }, { answer: '武康路2100号', answer_variants: ['2100号'] }))

// Variant match
console.log('Variant:', verifyPuzzle({ answerText: '2100号' }, { answer: '武康路2100号', answer_variants: ['2100号'] }))

// Wrong answer
console.log('Wrong:', verifyPuzzle({ answerText: '武康路100号' }, { answer: '武康路2100号', answer_variants: ['2100号'] }))

// Quiz correct
console.log('Quiz OK:', verifyQuiz({ selectedIndex: 2 }, { correct_index: 2, options: ['A','B','C','D'] }))

// Quiz wrong
console.log('Quiz NO:', verifyQuiz({ selectedIndex: 0 }, { correct_index: 2, options: ['A','B','C','D'] }))
"
```

Expected: First two pass, third fails, quiz correct passes, quiz wrong fails.

- [ ] **Step 3: Commit**

```bash
git add ducheng-api/src/services/verification/puzzle-verifier.js
git commit -m "feat(ducheng-api): puzzle and quiz answer verifiers"
```

---

### Task 4: Photo Verifier — GLM-4V API

**Files:** Create `ducheng-api/src/services/verification/photo-verifier.js`

- [ ] **Step 1: Create the photo verifier**

Create `ducheng-api/src/services/verification/photo-verifier.js`:

```javascript
/**
 * Photo verification using GLM-4V (智谱) multi-modal API.
 * Sends photo + prompt to the model, parses structured JSON response.
 *
 * Fallback rules:
 * - confidence >= threshold → approved
 * - confidence < threshold but > 0.5 → approved with warning
 * - GLM API unavailable → approved (graceful degradation)
 */

import { config } from '../../config.js'

/**
 * Build the verification prompt for GLM-4V.
 */
function buildPrompt(validationConfig) {
  const keywords = (validationConfig.keywords || []).join('、')
  return `你是一个照片审核助手。请判断这张照片是否符合以下要求：

要求：${validationConfig.prompt || '照片内容符合任务要求'}
关键元素：${keywords || '无特殊要求'}

请以 JSON 格式回复（不要包含 markdown 代码块标记），包含以下字段：
- pass: boolean，照片是否符合要求
- confidence: number (0-1)，你的置信度
- reason: string，简短的判定理由（中文，20字以内）

示例回复：{"pass": true, "confidence": 0.85, "reason": "照片清晰展示了武康大楼尖顶"}`
}

/**
 * Call GLM-4V API with the photo and prompt.
 *
 * @param {string} imageUrl - Full URL to the photo (must be publicly accessible)
 * @param {object} validationConfig - { prompt, keywords, accept_threshold }
 * @returns {Promise<{ passed: boolean, confidence: number|null, reason: string, warning?: string }>}
 */
export async function verifyPhoto(imageUrl, validationConfig) {
  const apiKey = config.glmApiKey
  const baseUrl = config.glmApiBaseUrl
  const model = config.glmModel

  // No API key → graceful degradation
  if (!apiKey) {
    return {
      passed: true,
      confidence: null,
      reason: 'Photo verification skipped (API key not configured)',
      warning: 'no_api_key',
    }
  }

  const threshold = validationConfig.accept_threshold || 0.7
  const prompt = buildPrompt(validationConfig)

  // Resolve image URL to absolute if it starts with /
  let fullImageUrl = imageUrl
  if (imageUrl.startsWith('/')) {
    // For local uploads, we need the full server URL
    // In production this would be the public domain
    const host = config.nodeEnv === 'production'
      ? 'https://ducheng-api.nju.top'
      : `http://localhost:${config.port}`
    fullImageUrl = `${host}${imageUrl}`
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: fullImageUrl } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 256,
      }),
      signal: AbortSignal.timeout(30_000), // 30s timeout
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown')
      console.error(`GLM API error ${response.status}: ${errorText}`)
      // API error → graceful degradation
      return {
        passed: true,
        confidence: null,
        reason: 'Photo verification skipped (API error)',
        warning: 'api_error',
      }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Parse JSON from response (handle possible markdown code block wrapping)
    let result
    try {
      const jsonStr = content.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
      result = JSON.parse(jsonStr)
    } catch (parseErr) {
      console.error('GLM response parse error:', content)
      // Parse error → graceful degradation
      return {
        passed: true,
        confidence: null,
        reason: 'Photo verification skipped (parse error)',
        warning: 'parse_error',
      }
    }

    const confidence = typeof result.confidence === 'number' ? result.confidence : 0
    const aiPass = result.pass === true
    const reason = result.reason || ''

    // Apply threshold logic
    if (aiPass && confidence >= threshold) {
      return { passed: true, confidence, reason }
    }

    if (confidence > 0.5) {
      // Below threshold but above 0.5 → approve with warning (avoid false negatives)
      return {
        passed: true,
        confidence,
        reason,
        warning: 'low_confidence',
      }
    }

    // Clearly failed
    return {
      passed: false,
      confidence,
      reason: reason || 'Photo does not meet the requirements',
    }
  } catch (err) {
    console.error('GLM API call failed:', err.message)
    // Network/timeout error → graceful degradation
    return {
      passed: true,
      confidence: null,
      reason: 'Photo verification skipped (network error)',
      warning: 'network_error',
    }
  }
}
```

- [ ] **Step 2: Verify module loads without errors**

```bash
cd ducheng-api && node -e "
import { verifyPhoto } from './src/services/verification/photo-verifier.js'

// Without API key — should gracefully degrade
const result = await verifyPhoto('/uploads/test.jpg', { prompt: 'test', keywords: ['test'], accept_threshold: 0.7 })
console.log('No API key result:', result)
"
```

Expected: `{ passed: true, confidence: null, reason: 'Photo verification skipped (API key not configured)', warning: 'no_api_key' }`

- [ ] **Step 3: Commit**

```bash
git add ducheng-api/src/services/verification/photo-verifier.js
git commit -m "feat(ducheng-api): GLM-4V photo verifier with graceful degradation"
```

---

### Task 5: Rewrite Submission Handler with Real Verification

**Files:** `ducheng-api/src/routes/submissions.js` (full rewrite of Phase 1A skeleton)

- [ ] **Step 1: Rewrite submissions.js with verification dispatch**

Replace the entire content of `ducheng-api/src/routes/submissions.js`:

```javascript
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
```

- [ ] **Step 2: Verify submission route still loads**

```bash
cd ducheng-api && node -e "import('./src/routes/submissions.js').then(() => console.log('OK'))"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add ducheng-api/src/routes/submissions.js
git commit -m "feat(ducheng-api): real verification dispatch in submission handler"
```

---

### Task 6: Badge Routes

**Files:** Create `ducheng-api/src/routes/badges.js`, modify `ducheng-api/src/index.js`

- [ ] **Step 1: Create badge routes**

Create `ducheng-api/src/routes/badges.js`:

```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add ducheng-api/src/routes/badges.js
git commit -m "feat(ducheng-api): badge collection route"
```

---

### Task 7: Poster Routes

**Files:** Create `ducheng-api/src/routes/posters.js`

- [ ] **Step 1: Create poster routes**

Create `ducheng-api/src/routes/posters.js`:

```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add ducheng-api/src/routes/posters.js
git commit -m "feat(ducheng-api): poster data route for completed tasks"
```

---

### Task 8: User Routes (me, stats, history)

**Files:** Create `ducheng-api/src/routes/me.js`

- [ ] **Step 1: Create user routes**

Create `ducheng-api/src/routes/me.js`:

```javascript
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
      // JWT payload fields are minimal — just the user ID.
      // Full profile data lives in tuchan-api.
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
```

- [ ] **Step 2: Commit**

```bash
git add ducheng-api/src/routes/me.js
git commit -m "feat(ducheng-api): user profile, stats, and history routes"
```

---

### Task 9: Register All New Routes in index.js

**Files:** `ducheng-api/src/index.js`

- [ ] **Step 1: Update index.js to import and register new routes**

Edit `ducheng-api/src/index.js`. Add the new imports alongside the existing ones:

```javascript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import path from 'node:path'
import { config } from './config.js'
import { registerRoutes } from './routes/tasks.js'
import { registerProgressRoutes } from './routes/progress.js'
import { registerSubmissionRoutes } from './routes/submissions.js'
import { registerUploadRoutes } from './routes/upload.js'
import { registerBadgeRoutes } from './routes/badges.js'
import { registerPosterRoutes } from './routes/posters.js'
import { registerUserRoutes } from './routes/me.js'

const app = Fastify({ logger: true })

await app.register(cors, { origin: config.corsOrigin })
await app.register(multipart, { limits: { fileSize: config.maxFileSize } })

// Serve uploaded files statically
await app.register(fastifyStatic, {
  root: path.resolve(config.uploadDir),
  prefix: '/uploads/',
})

// Health check
app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

// Register route modules
registerRoutes(app)
registerProgressRoutes(app)
registerSubmissionRoutes(app)
registerUploadRoutes(app)
registerBadgeRoutes(app)
registerPosterRoutes(app)
registerUserRoutes(app)

// Start server
try {
  await app.listen({ port: config.port, host: '0.0.0.0' })
  console.log(`ducheng-api running on port ${config.port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
```

- [ ] **Step 2: Verify server starts with all routes**

```bash
cd ducheng-api && node src/index.js
```

Expected: Server starts without errors. In another terminal, verify new routes exist:

```bash
# Health check
curl http://localhost:3100/api/health

# Badges (should return 401 without token)
curl http://localhost:3100/api/badges

# User info (should return 401 without token)
curl http://localhost:3100/api/me
```

Expected: Health returns OK, badges and me return `{"error":"No token provided"}`.

Stop the server.

- [ ] **Step 3: Commit**

```bash
git add ducheng-api/src/index.js
git commit -m "feat(ducheng-api): register badge, poster, and user routes"
```

---

### Task 10: End-to-End Verification with curl

**Files:** None (manual testing)

This task verifies the complete flow works end-to-end. You need seed data in the database and a valid JWT token.

- [ ] **Step 1: Create a seed script**

Create `ducheng-api/seed.js` (temporary, for testing):

```javascript
import 'dotenv/config'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

async function seed() {
  const client = await pool.connect()
  try {
    // Insert a test task
    const taskResult = await client.query(`
      INSERT INTO tasks (slug, title, description, cover_image, estimated_minutes, difficulty, badge_name, badge_icon, badge_color, location_summary, city, status, completion_count)
      VALUES ('test-wukang', 'Test Wukang Walk', 'A test task for verification', '/img/test.jpg', 60, 'easy', 'Wukang Walker', '🚶', '#4A90D9', 'Wukang Road', 'shanghai', 'published', 0)
      ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
      RETURNING id
    `)
    const taskId = taskResult.rows[0].id
    console.log('Task ID:', taskId)

    // Delete existing sub-tasks for this task (re-seed)
    await client.query('DELETE FROM sub_tasks WHERE task_id = $1', [taskId])

    // Insert sub-tasks (one of each type)
    await client.query(`
      INSERT INTO sub_tasks (task_id, order_index, location_name, location_address, location_lat, location_lng, type, title, instruction, validation_config, hints)
      VALUES
        ($1, 1, 'Wukang Building', 'Wukang Rd 393', 31.2064, 121.4384, 'arrival', 'Arrive at Wukang Building', 'Navigate to the Wukang Building.', '{"type":"arrival","lat":31.2064,"lng":121.4384,"radius_meters":100}', '["Look for the pointy building"]'),
        ($1, 2, 'Wukang Building', 'Wukang Rd 393', 31.2064, 121.4384, 'photo', 'Photo the Rooftop', 'Take a photo of the building rooftop.', '{"type":"photo","prompt":"Photo should show the top of a building","keywords":["building","rooftop"],"accept_threshold":0.7}', '["Point camera up"]'),
        ($1, 3, 'Wukang Building', 'Wukang Rd 393', 31.2064, 121.4384, 'puzzle', 'Building Number', 'What is the street number?', '{"type":"puzzle","answer":"393","answer_variants":["393号","武康路393号"],"answer_type":"text"}', '["Look at the door"]'),
        ($1, 4, 'Wukang Building', 'Wukang Rd 393', 31.2064, 121.4384, 'quiz', 'Architecture Style', 'What style is the building?', '{"type":"quiz","options":["Gothic","Art Deco","Baroque","Neoclassical"],"correct_index":1}', '["Think about the era"]')
    `, [taskId])

    console.log('Seeded 4 sub-tasks.')
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch(console.error)
```

Run it:

```bash
cd ducheng-api && node seed.js
```

Expected: `Task ID: <uuid>` and `Seeded 4 sub-tasks.`

- [ ] **Step 2: Generate a test JWT and run the full flow**

```bash
cd ducheng-api && node -e "
import jwt from 'jsonwebtoken'
const token = jwt.sign({ sub: '00000000-0000-0000-0000-000000000001' }, 'test-secret', { expiresIn: '1h' })
console.log(token)
"
```

Copy the token. Then start the server in one terminal and run these in another:

```bash
TOKEN="<paste-token>"

# 1. List tasks — should show test task
curl -s http://localhost:3100/api/tasks | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).items[0]?.slug))"

# 2. Start task
curl -s -X POST -H "Authorization: Bearer $TOKEN" http://localhost:3100/api/tasks/test-wukang/start

# 3. Submit arrival (correct GPS — within 100m)
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gpsLat":31.2065,"gpsLng":121.4385}' \
  http://localhost:3100/api/tasks/test-wukang/submit
# Expected: {"approved":true,"taskCompleted":false,"nextSubTask":{...type:"photo"...}}

# 4. Submit photo (will auto-approve since no GLM key)
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"photoUrl":"/uploads/test.jpg"}' \
  http://localhost:3100/api/tasks/test-wukang/submit
# Expected: {"approved":true,"taskCompleted":false,"nextSubTask":{...type:"puzzle"...}}

# 5. Submit puzzle answer
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answerText":"393号"}' \
  http://localhost:3100/api/tasks/test-wukang/submit
# Expected: {"approved":true,"taskCompleted":false,"nextSubTask":{...type:"quiz"...}}

# 6. Submit quiz (correct index = 1)
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"selectedIndex":1}' \
  http://localhost:3100/api/tasks/test-wukang/submit
# Expected: {"approved":true,"taskCompleted":true,"completionRank":1,"badge":{...}}

# 7. Check badges
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3100/api/badges
# Expected: badges array with test-wukang badge unlocked

# 8. Check poster
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3100/api/tasks/test-wukang/poster
# Expected: poster data with photos array

# 9. Check user stats
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3100/api/me/stats
# Expected: {"completedTasks":1,"inProgressTasks":0,"totalPhotos":1,"totalBadges":1}

# 10. Check history
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3100/api/me/history
# Expected: history array with test-wukang entry
```

- [ ] **Step 3: Test rejection + skip flow**

```bash
# Start fresh: delete existing progress for test user
cd ducheng-api && node -e "
import 'dotenv/config'
import pg from 'pg'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
await pool.query(\"DELETE FROM task_submissions WHERE user_id = '00000000-0000-0000-0000-000000000002'\")
await pool.query(\"DELETE FROM task_progress WHERE user_id = '00000000-0000-0000-0000-000000000002'\")
await pool.query(\"DELETE FROM user_badges WHERE user_id = '00000000-0000-0000-0000-000000000002'\")
await pool.query(\"DELETE FROM user_posters WHERE user_id = '00000000-0000-0000-0000-000000000002'\")
await pool.end()
console.log('Cleaned up')
"

# Generate a different test user token
TOKEN2=\$(node -e "import jwt from 'jsonwebtoken'; const t = jwt.sign({ sub: '00000000-0000-0000-0000-000000000002' }, 'test-secret', { expiresIn: '1h' }); console.log(t)")

# Start task
curl -s -X POST -H "Authorization: Bearer $TOKEN2" http://localhost:3100/api/tasks/test-wukang/start

# Submit wrong GPS 3 times
for i in 1 2 3; do
  curl -s -X POST -H "Authorization: Bearer $TOKEN2" \
    -H "Content-Type: application/json" \
    -d '{"gpsLat":32.0,"gpsLng":120.0}' \
    http://localhost:3100/api/tasks/test-wukang/submit
  echo ""
done
# Expected: 3x {"approved":false,...,"canSkip":false/false/true}

# Now skip
curl -s -X POST -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{"skip":true}' \
  http://localhost:3100/api/tasks/test-wukang/submit
# Expected: {"approved":true,"taskCompleted":false,"nextSubTask":{...type:"photo"...}}
```

- [ ] **Step 4: Clean up seed script**

```bash
rm ducheng-api/seed.js
```

- [ ] **Step 5: Commit**

```bash
git add ducheng-api/
git commit -m "feat(ducheng-api): Phase 1B complete — verification, badges, posters, user routes"
```

---

## Self-Review

### Spec Coverage

| Spec Requirement | Covered? | Task |
|-----------------|----------|------|
| Photo verification (GLM-4V) | Yes | Task 4 |
| Arrival verification (Haversine) | Yes | Task 2 |
| Puzzle verification (text match) | Yes | Task 3 |
| Quiz verification (index match) | Yes | Task 3 |
| Submission handler with real verification | Yes | Task 5 |
| Badge award on completion | Yes | Task 5 |
| Completion rank calculation | Yes | Task 5 |
| Skip after 3 failures | Yes | Task 5 |
| GET /api/badges | Yes | Task 6 |
| GET /api/tasks/:slug/poster | Yes | Task 7 |
| GET /api/me | Yes | Task 8 |
| GET /api/me/stats | Yes | Task 8 |
| GET /api/me/history | Yes | Task 8 |
| GLM graceful degradation (no key) | Yes | Task 4 |
| GLM graceful degradation (API error) | Yes | Task 4 |
| GLM low-confidence approve (> 0.5) | Yes | Task 4 |
| Route registration in index.js | Yes | Task 9 |
| End-to-end verification | Yes | Task 10 |

### Fallback Rules Implemented

| Scenario | Behavior | Location |
|----------|----------|----------|
| `confidence >= threshold` | Approved | photo-verifier.js |
| `confidence < threshold && > 0.5` | Approved + warning | photo-verifier.js |
| GLM API key not set | Approved + warning | photo-verifier.js |
| GLM API HTTP error | Approved + warning | photo-verifier.js |
| GLM API network timeout | Approved + warning | photo-verifier.js |
| GLM response parse error | Approved + warning | photo-verifier.js |
| 3 failed attempts on same sub-task | Can skip | submissions.js |
| Target GPS not configured | Approved | arrival-verifier.js |
| Unknown sub-task type | Auto-approved | submissions.js |

### Placeholder Scan

No TBD/TODO found. All code steps contain complete implementations.

### Dependencies on Phase 1A

This plan assumes these Phase 1A artifacts exist and work:
- `src/config.js` with base fields (port, databaseUrl, jwtSecret, uploadDir, etc.)
- `src/db/client.js` exporting `db` (Drizzle instance)
- `src/db/schema.js` exporting all table definitions
- `src/middleware/auth.js` exporting `authPreHandler`
- `src/services/task-service.js` exporting `getTaskBySlug`, `getSubTaskByIndex`, `getSubTasksForTask`
- `src/routes/tasks.js`, `progress.js`, `upload.js` (unchanged)
- `src/index.js` (modified in Task 9 to add new route imports)
