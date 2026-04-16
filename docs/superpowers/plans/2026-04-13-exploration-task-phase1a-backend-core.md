# Exploration Task System — Phase 1A: Backend Core

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the runnable ducheng-api backend server with database, authentication, task CRUD, progress tracking, and photo upload — all the endpoints the frontend needs to start integrating against.

**Architecture:** Fastify HTTP server on port 3100, PostgreSQL database on existing Aliyun RDS (separate `ducheng` database), JWT auth shared with tuchan-api. Drizzle ORM for schema definition and queries. Photos stored on local filesystem. ESM modules throughout.

**Tech Stack:** Node.js, Fastify, Drizzle ORM, node-postgres (pg), jsonwebtoken, @fastify/multipart

**Pre-requisites:**
- Node.js 18+ installed
- Access to Aliyun RDS PostgreSQL (credentials in `D:\work\.env.shared`)
- The `ducheng` database and user may need to be created on RDS first (see Task 0)

---

## File Structure

```
ducheng-api/                         # New project directory at D:\work\shanghaitrip\ducheng-api\
├── src/
│   ├── index.js                     # Fastify entry point + plugin registration
│   ├── config.js                    # Environment config (dotenv wrapper)
│   ├── db/
│   │   ├── client.js                # Drizzle + pg connection singleton
│   │   └── schema.js                # All table definitions (tasks, sub_tasks, task_progress, task_submissions, user_badges, user_posters)
│   ├── middleware/
│   │   └── auth.js                  # JWT verification (shared tuchan secret)
│   ├── routes/
│   │   ├── tasks.js                 # GET /tasks, GET /tasks/:slug
│   │   ├── progress.js              # POST /tasks/:slug/start, GET /tasks/:slug/progress
│   │   ├── submissions.js           # POST /tasks/:slug/submit
│   │   └── upload.js                # POST /upload/photo
│   └── services/
│       └── task-service.js          # Task query helpers
├── uploads/                         # Photo storage directory (gitignored)
├── drizzle.config.js                # Drizzle Kit migration config
├── ecosystem.config.cjs             # PM2 production config
├── package.json
├── .env                             # Local environment (gitignored)
└── .gitignore
```

---

### Task 0: Database Pre-requisite

**Files:** None (manual step on RDS)

- [ ] **Step 1: Create the ducheng database and user on RDS**

Connect to the Aliyun RDS PostgreSQL as admin and run:

```sql
-- Create the ducheng database
CREATE DATABASE ducheng;

-- Connect to ducheng database, then create schema
\c ducheng
CREATE SCHEMA IF NOT EXISTS app;

-- The user 'ducheng' may already exist; if not:
-- CREATE USER ducheng WITH PASSWORD 'Charfield123';
-- GRANT ALL PRIVILEGES ON DATABASE ducheng TO ducheng;
-- GRANT ALL PRIVILEGES ON SCHEMA app TO ducheng;
```

If the user/database already exists (from .env.shared), skip this step. Verify with:

```bash
psql "postgresql://ducheng:Charfield123@pgm-bp1b088t3trudmm1.pg.rds.aliyuncs.com:5432/ducheng?sslmode=disable" -c "SELECT 1"
```

Expected: `?column?` row with value `1`

---

### Task 1: Project Scaffolding

**Files:**
- Create: `ducheng-api/package.json`
- Create: `ducheng-api/.env`
- Create: `ducheng-api/.gitignore`

- [ ] **Step 1: Create project directory and package.json**

```bash
mkdir -p ducheng-api/src/{db,middleware,routes,services} ducheng-api/uploads
```

Create `ducheng-api/package.json`:

```json
{
  "name": "ducheng-api",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "fastify": "^4.28.0",
    "@fastify/cors": "^9.0.0",
    "@fastify/multipart": "^8.3.0",
    "drizzle-orm": "^0.36.0",
    "@fastify/static": "^7.0.0",
    "pg": "^8.13.0",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.4.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.28.0"
  }
}
```

- [ ] **Step 2: Create .env file**

Copy from `D:\work\.env.shared` and adapt. Create `ducheng-api/.env`:

```bash
# Database
DATABASE_URL=postgresql://ducheng:Charfield123@pgm-bp1b088t3trudmm1.pg.rds.aliyuncs.com:5432/ducheng?sslmode=disable

# Auth (shared with tuchan-api)
TUCHAN_JWT_SECRET=xQt2OqUSR3Qo2et4CucuRXhZgZ7haSgcq9iJbEP93CYN+Sb1A6xzFm4Rabo0ujl1

# Server
PORT=3100
NODE_ENV=development

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# GLM API (for Phase 1B photo verification)
GLM_API_KEY=
GLM_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

- [ ] **Step 3: Create .gitignore**

Create `ducheng-api/.gitignore`:

```
node_modules/
.env
uploads/
*.log
```

- [ ] **Step 4: Install dependencies**

```bash
cd ducheng-api && npm install
```

Expected: `node_modules/` created, `package-lock.json` generated

- [ ] **Step 5: Commit**

```bash
cd ..
git add ducheng-api/package.json ducheng-api/package-lock.json ducheng-api/.gitignore ducheng-api/.env
git commit -m "feat(ducheng-api): scaffold project with dependencies"
```

---

### Task 2: Config + Fastify Server

**Files:**
- Create: `ducheng-api/src/config.js`
- Create: `ducheng-api/src/index.js`

- [ ] **Step 1: Create config.js**

Create `ducheng-api/src/config.js`:

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
}
```

- [ ] **Step 2: Create Fastify entry point**

Create `ducheng-api/src/index.js`:

```javascript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { config } from './config.js'
import { registerRoutes } from './routes/tasks.js'
import { registerProgressRoutes } from './routes/progress.js'
import { registerSubmissionRoutes } from './routes/submissions.js'
import { registerUploadRoutes } from './routes/upload.js'

const app = Fastify({ logger: true })

await app.register(cors, { origin: config.corsOrigin })
await app.register(multipart, { limits: { fileSize: config.maxFileSize } })

// Health check
app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

// Register route modules
registerRoutes(app)
registerProgressRoutes(app)
registerSubmissionRoutes(app)
registerUploadRoutes(app)

// Start server
try {
  await app.listen({ port: config.port, host: '0.0.0.0' })
  console.log(`ducheng-api running on port ${config.port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
```

- [ ] **Step 3: Verify server starts**

```bash
cd ducheng-api && node src/index.js
```

Expected: Server logs `ducheng-api running on port 3100`. In another terminal:

```bash
curl http://localhost:3100/api/health
```

Expected: `{"status":"ok","timestamp":"..."}`

Stop the server with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add ducheng-api/src/
git commit -m "feat(ducheng-api): Fastify server with config and health check"
```

---

### Task 3: Database Schema

**Files:**
- Create: `ducheng-api/src/db/schema.js`

- [ ] **Step 1: Create the full Drizzle schema**

Create `ducheng-api/src/db/schema.js`:

```javascript
import {
  pgTable, uuid, varchar, text, integer, decimal,
  timestamp, jsonb, pgEnum
} from 'drizzle-orm/pg-core'

// Enums
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard'])
export const taskStatusEnum = pgEnum('task_status', ['draft', 'published', 'archived'])
export const subTaskTypeEnum = pgEnum('sub_task_type', ['photo', 'arrival', 'puzzle', 'quiz'])
export const submissionStatusEnum = pgEnum('submission_status', ['pending', 'approved', 'rejected'])
export const progressStatusEnum = pgEnum('progress_status', ['not_started', 'in_progress', 'completed'])

// Tasks
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  title: varchar('title', { length: 128 }).notNull(),
  description: text('description').notNull(),
  coverImage: varchar('cover_image', { length: 256 }),
  estimatedMinutes: integer('estimated_minutes'),
  difficulty: difficultyEnum('difficulty').default('medium'),
  badgeName: varchar('badge_name', { length: 64 }),
  badgeIcon: varchar('badge_icon', { length: 16 }),
  badgeColor: varchar('badge_color', { length: 7 }),
  locationSummary: varchar('location_summary', { length: 256 }),
  city: varchar('city', { length: 32 }).notNull(),
  status: taskStatusEnum('status').default('published'),
  completionCount: integer('completion_count').default(0),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Sub-tasks
export const subTasks = pgTable('sub_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  orderIndex: integer('order_index').notNull(),
  locationName: varchar('location_name', { length: 128 }),
  locationAddress: varchar('location_address', { length: 256 }),
  locationLat: decimal('location_lat', { precision: 10, scale: 7 }),
  locationLng: decimal('location_lng', { precision: 10, scale: 7 }),
  type: subTaskTypeEnum('type').notNull(),
  title: varchar('title', { length: 128 }).notNull(),
  instruction: text('instruction').notNull(),
  validationConfig: jsonb('validation_config'),
  hints: jsonb('hints'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Task submissions
export const taskSubmissions = pgTable('task_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  subTaskId: uuid('sub_task_id').notNull().references(() => subTasks.id),
  status: submissionStatusEnum('status').default('pending'),
  photoUrl: varchar('photo_url', { length: 256 }),
  answerText: varchar('answer_text', { length: 256 }),
  gpsLat: decimal('gps_lat', { precision: 10, scale: 7 }),
  gpsLng: decimal('gps_lng', { precision: 10, scale: 7 }),
  aiResult: jsonb('ai_result'),
  aiConfidence: decimal('ai_confidence', { precision: 3, scale: 2 }),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
})

// Task progress
export const taskProgress = pgTable('task_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  currentSubTaskIndex: integer('current_sub_task_index').default(0),
  status: progressStatusEnum('status').default('not_started'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  completionRank: integer('completion_rank'),
})

// User badges
export const userBadges = pgTable('user_badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).defaultNow(),
})

// User posters
export const userPosters = pgTable('user_posters', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  imageUrl: varchar('image_url', { length: 256 }),
  photos: jsonb('photos'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
```

- [ ] **Step 2: Commit**

```bash
git add ducheng-api/src/db/schema.js
git commit -m "feat(ducheng-api): Drizzle schema for all 6 tables"
```

---

### Task 4: Database Connection + Migration

**Files:**
- Create: `ducheng-api/src/db/client.js`
- Create: `ducheng-api/drizzle.config.js`

- [ ] **Step 1: Create database client**

Create `ducheng-api/src/db/client.js`:

```javascript
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.js'
import { config } from '../config.js'

const pool = new pg.Pool({ connectionString: config.databaseUrl })

export const db = drizzle(pool, { schema })

export async function checkConnection() {
  try {
    const result = await pool.query('SELECT 1 as ok')
    return result.rows[0].ok === 1
  } catch (err) {
    console.error('Database connection failed:', err.message)
    return false
  }
}
```

- [ ] **Step 2: Create drizzle config for migrations**

Create `ducheng-api/drizzle.config.js`:

```javascript
import 'dotenv/config'

export default {
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
}
```

- [ ] **Step 3: Push schema to database**

Use `drizzle-kit push` to create tables directly (for dev; `drizzle-kit generate` + `migrate` for production):

```bash
cd ducheng-api && npx drizzle-kit push
```

Expected: Prompts to apply changes, creates tables `tasks`, `sub_tasks`, `task_submissions`, `task_progress`, `user_badges`, `user_posters`. Confirm with `yes`.

Verify:

```bash
psql "$DATABASE_URL" -c "\dt"
```

Expected: Lists all 6 tables.

- [ ] **Step 4: Commit**

```bash
git add ducheng-api/src/db/client.js ducheng-api/drizzle.config.js
git commit -m "feat(ducheng-api): database client and drizzle-kit config"
```

---

### Task 5: Auth Middleware

**Files:**
- Create: `ducheng-api/src/middleware/auth.js`

- [ ] **Step 1: Create JWT auth middleware**

Create `ducheng-api/src/middleware/auth.js`:

```javascript
import jwt from 'jsonwebtoken'
import { config } from '../config.js'

/**
 * Verifies JWT token from Authorization header.
 * Uses shared TUCHAN_JWT_SECRET — same as tuchan-api and Nannaricher.
 * In dev mode without secret, decodes without verification.
 */
export function verifyToken(token) {
  if (!config.jwtSecret) {
    // Dev mode: decode without verification
    try {
      const decoded = jwt.decode(token)
      if (!decoded?.sub) return null
      return { payload: decoded, verified: false }
    } catch {
      return null
    }
  }

  try {
    const payload = jwt.verify(token, Buffer.from(config.jwtSecret, 'base64'), {
      algorithms: ['HS256', 'HS384', 'HS512'],
    })
    return { payload, verified: true }
  } catch {
    return null
  }
}

/**
 * Fastify preHandler hook that extracts userId from JWT.
 * Sets request.userId on success, returns 401 on failure.
 */
export function authPreHandler(request, reply) {
  const authHeader = request.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return reply.code(401).send({ error: 'No token provided' })
  }

  const result = verifyToken(token)
  if (!result) {
    return reply.code(401).send({ error: 'Invalid or expired token' })
  }

  request.userId = result.payload.sub
}

/**
 * Optional auth: sets userId if token present, but doesn't block.
 */
export function optionalAuthPreHandler(request, reply) {
  const authHeader = request.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (token) {
    const result = verifyToken(token)
    if (result) {
      request.userId = result.payload.sub
    }
  }
}
```

- [ ] **Step 2: Verify auth middleware works**

Add a test route to `src/index.js` temporarily:

```javascript
import { authPreHandler } from './middleware/auth.js'

// Temporary test route — remove after verification
app.get('/api/me', { preHandler: authPreHandler }, async (request) => {
  return { userId: request.userId }
})
```

Start server and test:

```bash
# Without token — should get 401
curl http://localhost:3100/api/me
# Expected: {"error":"No token provided"}

# With dummy token (dev mode, no JWT_SECRET verification)
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTEyMzQtMTIzNC0xMjM0NTY3ODkwMTIifQ.fake" http://localhost:3100/api/me
# Expected: {"userId":"12345678-1234-1234-1234-123456789012"} (in dev mode without secret)
```

Remove the test route from `src/index.js` after verification.

- [ ] **Step 3: Commit**

```bash
git add ducheng-api/src/middleware/auth.js
git commit -m "feat(ducheng-api): JWT auth middleware with shared tuchan secret"
```

---

### Task 6: Task Routes — List + Detail

**Files:**
- Create: `ducheng-api/src/services/task-service.js`
- Create: `ducheng-api/src/routes/tasks.js`

- [ ] **Step 1: Create task service**

Create `ducheng-api/src/services/task-service.js`:

```javascript
import { db } from '../db/client.js'
import { tasks, subTasks } from '../db/schema.js'
import { eq, sql, and } from 'drizzle-orm'

/**
 * List published tasks with optional city filter and pagination.
 */
export async function listTasks({ city, page = 1, pageSize = 20 }) {
  const conditions = [eq(tasks.status, 'published')]
  if (city) conditions.push(eq(tasks.city, city))

  const offset = (page - 1) * pageSize

  const [items, countResult] = await Promise.all([
    db.select().from(tasks)
      .where(and(...conditions))
      .orderBy(tasks.createdAt)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql`count(*)` }).from(tasks)
      .where(and(...conditions)),
  ])

  const total = Number(countResult[0]?.count ?? 0)

  return {
    items: items.map(({ status, ...rest }) => rest),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Get a single published task by slug, including its sub-task list (overview only).
 */
export async function getTaskBySlug(slug) {
  const [task] = await db.select().from(tasks)
    .where(and(eq(tasks.slug, slug), eq(tasks.status, 'published')))
    .limit(1)

  if (!task) return null

  const subs = await db.select({
    id: subTasks.id,
    orderIndex: subTasks.orderIndex,
    type: subTasks.type,
    title: subTasks.title,
    locationName: subTasks.locationName,
  }).from(subTasks)
    .where(eq(subTasks.taskId, task.id))
    .orderBy(subTasks.orderIndex)

  return {
    ...task,
    subTasks: subs,
    totalSubTasks: subs.length,
  }
}

/**
 * Get a specific sub-task by task ID and order index.
 */
export async function getSubTaskByIndex(taskId, orderIndex) {
  const [sub] = await db.select().from(subTasks)
    .where(and(eq(subTasks.taskId, taskId), eq(subTasks.orderIndex, orderIndex)))
    .limit(1)
  return sub || null
}

/**
 * Get all sub-tasks for a task (for progress tracking).
 */
export async function getSubTasksForTask(taskId) {
  return db.select().from(subTasks)
    .where(eq(subTasks.taskId, taskId))
    .orderBy(subTasks.orderIndex)
}
```

- [ ] **Step 2: Create task routes**

Create `ducheng-api/src/routes/tasks.js`:

```javascript
import { listTasks, getTaskBySlug } from '../services/task-service.js'

export function registerRoutes(app) {
  // GET /api/tasks — list tasks (public, no auth required)
  app.get('/api/tasks', async (request) => {
    const { city, page, pageSize } = request.query
    return listTasks({
      city: city || undefined,
      page: parseInt(page || '1', 10),
      pageSize: parseInt(pageSize || '20', 10),
    })
  })

  // GET /api/tasks/:slug — task detail with sub-task overview (public)
  app.get('/api/tasks/:slug', async (request, reply) => {
    const { slug } = request.params
    const task = await getTaskBySlug(slug)

    if (!task) {
      return reply.code(404).send({ error: 'Task not found' })
    }

    return task
  })
}
```

- [ ] **Step 3: Verify task routes**

Start the server (no seed data yet, so list will be empty):

```bash
cd ducheng-api && node src/index.js
```

```bash
curl http://localhost:3100/api/tasks
# Expected: {"items":[],"total":0,"page":1,"pageSize":20,"totalPages":0}

curl http://localhost:3100/api/tasks/nonexistent
# Expected: {"error":"Task not found"}
```

- [ ] **Step 4: Commit**

```bash
git add ducheng-api/src/services/task-service.js ducheng-api/src/routes/tasks.js
git commit -m "feat(ducheng-api): task list and detail API routes"
```

---

### Task 7: Task Progress Routes

**Files:**
- Create: `ducheng-api/src/routes/progress.js`

- [ ] **Step 1: Create progress routes**

Create `ducheng-api/src/routes/progress.js`:

```javascript
import { db } from '../db/client.js'
import { tasks, taskProgress, subTasks } from '../db/schema.js'
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
```

- [ ] **Step 2: Verify progress routes**

Need a token to test. Create a test helper `ducheng-api/test-helper.js`:

```javascript
import jwt from 'jsonwebtoken'
import { config } from './src/config.js'

// Generate a test token (dev mode — secret may not be set)
const token = jwt.sign(
  { sub: '00000000-0000-0000-0000-000000000001', phone: '13800000001' },
  'test-secret',
  { expiresIn: '1h' }
)
console.log(token)
```

```bash
cd ducheng-api && node test-helper.js
# Copy the token, then:
TOKEN="<paste-token>"

# Should return 404 — no task exists yet
curl -H "Authorization: Bearer $TOKEN" http://localhost:3100/api/tasks/test-slug/progress

# Should return 404 — task slug doesn't exist
curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:3100/api/tasks/test-slug/start
```

Remove `test-helper.js` after verification.

- [ ] **Step 3: Commit**

```bash
git add ducheng-api/src/routes/progress.js
git commit -m "feat(ducheng-api): task progress start and get routes"
```

---

### Task 8: Photo Upload Route

**Files:**
- Create: `ducheng-api/src/routes/upload.js`

- [ ] **Step 1: Create upload route**

Create `ducheng-api/src/routes/upload.js`:

```javascript
import fs from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { nanoid } from 'nanoid'
import { config } from '../config.js'
import { authPreHandler } from '../middleware/auth.js'

export function registerUploadRoutes(app) {
  // POST /api/upload/photo — upload a photo, return URL
  app.post('/api/upload/photo', { preHandler: authPreHandler }, async (request, reply) => {
    const data = await request.file()
    if (!data) {
      return reply.code(400).send({ error: 'No file provided' })
    }

    // Validate file type
    if (!data.mimetype.startsWith('image/')) {
      return reply.code(400).send({ error: 'Only image files are allowed' })
    }

    // Generate unique filename
    const ext = path.extname(data.filename || '.jpg') || '.jpg'
    const filename = `${nanoid(16)}${ext}`
    const filepath = path.join(config.uploadDir, filename)

    // Ensure upload directory exists
    await fs.mkdir(config.uploadDir, { recursive: true })

    // Save file
    const buffer = await data.toBuffer()
    await fs.writeFile(filepath, buffer)

    // Return the URL path (will be served statically or proxied)
    const url = `/uploads/${filename}`

    return { url, filename }
  })
}
```

- [ ] **Step 2: Register static file serving for uploads**

Update `ducheng-api/src/index.js` — add the static plugin import and registration:

```javascript
import fastifyStatic from '@fastify/static'
import path from 'node:path'
import { config } from './config.js'

// ... after other plugin registrations ...

// Serve uploaded files statically
await app.register(fastifyStatic, {
  root: path.resolve(config.uploadDir),
  prefix: '/uploads/',
})
```

Note: The `@fastify/static` package should already be included. If not, add it: `npm install @fastify/static`.

- [ ] **Step 3: Verify upload route**

```bash
# Create a small test image
echo "fake-image-data" > /tmp/test-photo.jpg

# Upload with auth token
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test-photo.jpg" \
  http://localhost:3100/api/upload/photo
# Expected: {"url":"/uploads/xxxxx.jpg","filename":"xxxxx.jpg"}

# Verify file is accessible
curl http://localhost:3100/uploads/xxxxx.jpg
# Expected: returns the file content
```

- [ ] **Step 4: Commit**

```bash
git add ducheng-api/src/routes/upload.js ducheng-api/src/index.js
git commit -m "feat(ducheng-api): photo upload route with static file serving"
```

---

### Task 9: SubTask Submit Route

**Files:**
- Create: `ducheng-api/src/routes/submissions.js`

This creates the submit endpoint that handles all sub-task types. Verification logic (GPS distance, answer matching, AI photo) will be added in Phase 1B — for now, submissions auto-approve.

- [ ] **Step 1: Create submission routes**

Create `ducheng-api/src/routes/submissions.js`:

```javascript
import { db } from '../db/client.js'
import { taskSubmissions, taskProgress, subTasks } from '../db/schema.js'
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

    // Verify submission matches sub-task type
    const validationConfig = currentSubTask.validationConfig || {}
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
```

- [ ] **Step 2: Verify submission route**

With a test token and no seed data, we can't fully test yet. But verify the route exists:

```bash
# Should return 401 without token
curl -X POST http://localhost:3100/api/tasks/test/submit
# Expected: {"error":"No token provided"}

# With token but no task — should return 404
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answer":"test"}' \
  http://localhost:3100/api/tasks/test/submit
# Expected: {"error":"Task not found"}
```

- [ ] **Step 3: Commit**

```bash
git add ducheng-api/src/routes/submissions.js
git commit -m "feat(ducheng-api): sub-task submit route (auto-approve for Phase 1A)"
```

---

### Task 10: PM2 Config

**Files:**
- Create: `ducheng-api/ecosystem.config.cjs`

- [ ] **Step 1: Create PM2 ecosystem config**

Create `ducheng-api/ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [{
    name: 'ducheng-api',
    script: 'src/index.js',
    cwd: '/var/www/ducheng-api',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3100,
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    kill_timeout: 5000,
    listen_timeout: 10000,
  }],
}
```

- [ ] **Step 2: Commit**

```bash
git add ducheng-api/ecosystem.config.cjs
git commit -m "feat(ducheng-api): PM2 production config"
```

---

## Self-Review

### Spec Coverage

| Spec Section | Covered? | Task |
|-------------|----------|------|
| Data model (6 tables) | Yes | Task 3 |
| Database connection (Drizzle + pg) | Yes | Task 4 |
| JWT auth middleware | Yes | Task 5 |
| GET /tasks | Yes | Task 6 |
| GET /tasks/:slug | Yes | Task 6 |
| POST /tasks/:slug/start | Yes | Task 7 |
| GET /tasks/:slug/progress | Yes | Task 7 |
| POST /tasks/:slug/submit | Yes | Task 9 (auto-approve) |
| POST /upload/photo | Yes | Task 8 |
| PM2 config | Yes | Task 10 |
| GET /api/health | Yes | Task 2 |

**Not covered (deferred to Phase 1B):** Verification services (GPS, answer, AI photo), badge service, poster generation, user routes, seed data.

### Placeholder Scan

No TBD/TODO found. All code steps contain complete implementations.

### Type Consistency

- `task.id` (uuid) used consistently as FK in sub_tasks, task_progress, task_submissions, user_badges, user_posters
- `userId` from JWT `sub` claim (string UUID) used consistently across progress and submissions
- `currentSubTaskIndex` (integer) used as 1-based index, matching `subTasks.orderIndex`
- `slug` (varchar) used for URL routing, `id` (uuid) for internal references
