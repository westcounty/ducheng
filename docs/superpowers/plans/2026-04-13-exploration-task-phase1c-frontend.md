# Exploration Task System — Phase 1C: Frontend — Task Browsing & Execution

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete frontend for the exploration task module — task browsing, task detail, guided subtask execution with type-specific inputs (photo/GPS/puzzle/quiz), badge collection, and completion poster. Integrates into the existing 读城 Vue 3 H5 app alongside the puzzle game.

**Architecture:** New pages, components, a Pinia store, and an API service module added to the existing `app/src/` tree. All routes use Vue Router hash mode. API calls go through a thin `fetch`-based service layer with JWT auth. The explore module uses the `theme-default` dark theme (no city theme binding).

**Tech Stack:** Vue 3 (Composition API, `<script setup>`), Vite, Pinia, Vue Router (hash mode), native `fetch`

**Pre-requisites:** Phase 1A+1B backend running on port 3100. Vite dev server proxies `/api` to `localhost:3100`.

**⚠️ Auth Supplement:** This plan's token management and login prompt are stubs. After completing this plan, apply **Phase 1C Auth Supplement** (`2026-04-13-exploration-task-phase1c-auth-supplement.md`) which adds the full login page, auth Pinia store (tuchan-api integration), and replaces the inline token/prompt stubs with proper auth flow.

---

## File Structure

```
app/src/
├── services/
│   └── explore-api.js              # NEW — fetch wrapper with JWT auth for all explore endpoints
├── stores/
│   ├── game.js                     # EXISTING — unchanged
│   ├── platform.js                 # EXISTING — unchanged
│   └── explore.js                  # NEW — Pinia store for explore module state
├── pages/
│   ├── PlatformHome.vue            # MODIFY — add explore entry point
│   ├── TaskList.vue                # NEW — /#/explore
│   ├── TaskDetail.vue              # NEW — /#/explore/:slug
│   ├── TaskPlay.vue                # NEW — /#/explore/:slug/play
│   ├── PosterView.vue              # NEW — /#/explore/:slug/poster
│   └── BadgeCollection.vue         # NEW — /#/badges
├── components/
│   ├── TaskCard.vue                # NEW — card for task list
│   ├── SubTaskProgress.vue         # NEW — horizontal progress chain
│   ├── PhotoSubmit.vue             # NEW — camera + upload + AI feedback
│   ├── ArrivalCheck.vue            # NEW — GPS verification
│   ├── PuzzleInput.vue             # NEW — text answer input
│   ├── QuizInput.vue               # NEW — multiple choice
│   ├── BadgeCard.vue               # NEW — single badge (locked/unlocked)
│   └── PosterCanvas.vue            # NEW — poster layout + download
├── router.js                       # MODIFY — add explore routes + auth guard
└── styles/
    └── explore.css                 # NEW — explore module styles
```

---

### Task 1: Vite Proxy + API Service Layer

**Files:**
- Modify: `app/vite.config.js`
- Create: `app/src/services/explore-api.js`

- [ ] **Step 1: Add API proxy to Vite dev server**

This lets the frontend call `/api/*` during development and have it forwarded to the Fastify backend on port 3100.

Modify `app/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3100',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3100',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 2: Create the API service module**

Create `app/src/services/explore-api.js`:

```javascript
// app/src/services/explore-api.js
// Thin fetch wrapper for all exploration task API endpoints.
// JWT token is read from localStorage (set by tuchan-api login flow).

const TOKEN_KEY = 'ducheng_explore_token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isLoggedIn() {
  return !!getToken()
}

async function request(path, options = {}) {
  const headers = { ...options.headers }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  const res = await fetch(`/api${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    throw new ApiError('请先登录', 401)
  }

  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(data.error || '请求失败', res.status, data)
  }

  return data
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// ─── Task endpoints ───────────────────────────────────

export function fetchTasks({ city, page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams()
  if (city) params.set('city', city)
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))
  return request(`/tasks?${params}`)
}

export function fetchTaskDetail(slug) {
  return request(`/tasks/${slug}`)
}

// ─── Progress endpoints ───────────────────────────────

export function startTask(slug) {
  return request(`/tasks/${slug}/start`, { method: 'POST' })
}

export function fetchProgress(slug) {
  return request(`/tasks/${slug}/progress`)
}

export function submitSubTask(slug, payload) {
  return request(`/tasks/${slug}/submit`, {
    method: 'POST',
    body: payload,
  })
}

// ─── Upload ───────────────────────────────────────────

export async function uploadPhoto(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/upload/photo', {
    method: 'POST',
    body: formData,
  })
}

// ─── Poster ───────────────────────────────────────────

export function fetchPoster(slug) {
  return request(`/tasks/${slug}/poster`)
}

// ─── Badges ───────────────────────────────────────────

export function fetchBadges() {
  return request('/badges')
}

// ─── User ─────────────────────────────────────────────

export function fetchMe() {
  return request('/me')
}

export function fetchMyStats() {
  return request('/me/stats')
}

export function fetchMyHistory() {
  return request('/me/history')
}
```

- [ ] **Step 3: Verify proxy works**

Start the backend (`cd ducheng-api && npm run dev`) and the frontend (`cd app && npm run dev`). In a browser, open `http://localhost:3000` and in the console run:

```javascript
fetch('/api/health').then(r => r.json()).then(console.log)
// Expected: {status: "ok", timestamp: "..."}
```

- [ ] **Step 4: Commit**

```bash
git add app/vite.config.js app/src/services/explore-api.js
git commit -m "feat(explore): API service layer with Vite proxy to ducheng-api"
```

---

### Task 2: Explore Pinia Store

**Files:**
- Create: `app/src/stores/explore.js`

- [ ] **Step 1: Create the explore store**

Create `app/src/stores/explore.js`:

```javascript
// app/src/stores/explore.js
// Pinia store for the exploration task module.
// Manages task list, current task, progress, and badges.

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchTasks,
  fetchTaskDetail,
  startTask,
  fetchProgress,
  submitSubTask,
  uploadPhoto,
  fetchPoster,
  fetchBadges,
  isLoggedIn,
} from '../services/explore-api.js'

export const useExploreStore = defineStore('explore', () => {
  // ─── Task list state ──────────────────────────────────

  const taskList = ref([])
  const taskListTotal = ref(0)
  const taskListPage = ref(1)
  const taskListLoading = ref(false)
  const taskListCity = ref(null) // city filter

  async function loadTasks({ city, page = 1, reset = false } = {}) {
    taskListLoading.value = true
    try {
      const data = await fetchTasks({ city, page })
      if (reset) {
        taskList.value = data.items
      } else {
        taskList.value = [...taskList.value, ...data.items]
      }
      taskListTotal.value = data.total
      taskListPage.value = data.page
      taskListCity.value = city || null
    } finally {
      taskListLoading.value = false
    }
  }

  // ─── Current task detail ──────────────────────────────

  const currentTask = ref(null)
  const taskLoading = ref(false)

  async function loadTaskDetail(slug) {
    taskLoading.value = true
    try {
      currentTask.value = await fetchTaskDetail(slug)
    } finally {
      taskLoading.value = false
    }
  }

  // ─── Progress state ───────────────────────────────────

  const progress = ref(null)
  const currentSubTask = ref(null)
  const totalSubTasks = ref(0)
  const progressLoading = ref(false)
  const submitLoading = ref(false)
  const submitResult = ref(null) // { approved, taskCompleted, nextSubTask, ... }

  const isTaskCompleted = computed(() => progress.value?.status === 'completed')
  const currentIndex = computed(() => progress.value?.currentSubTaskIndex ?? 0)

  async function doStartTask(slug) {
    progressLoading.value = true
    try {
      const data = await startTask(slug)
      progress.value = data.progress
      currentSubTask.value = data.currentSubTask
      return data
    } finally {
      progressLoading.value = false
    }
  }

  async function loadProgress(slug) {
    progressLoading.value = true
    try {
      const data = await fetchProgress(slug)
      progress.value = data.progress
      currentSubTask.value = data.currentSubTask || null
      totalSubTasks.value = data.totalSubTasks || 0

      if (data.completed) {
        return { completed: true }
      }
      return data
    } catch (err) {
      if (err.status === 404) {
        // Not started yet
        progress.value = null
        currentSubTask.value = null
      }
      throw err
    } finally {
      progressLoading.value = false
    }
  }

  async function doSubmit(slug, payload) {
    submitLoading.value = true
    submitResult.value = null
    try {
      const data = await submitSubTask(slug, payload)
      submitResult.value = data

      if (data.approved && !data.taskCompleted) {
        // Advance to next sub-task
        currentSubTask.value = data.nextSubTask
        if (progress.value) {
          progress.value = {
            ...progress.value,
            currentSubTaskIndex: progress.value.currentSubTaskIndex + 1,
          }
        }
      }

      if (data.taskCompleted) {
        if (progress.value) {
          progress.value = { ...progress.value, status: 'completed' }
        }
      }

      return data
    } finally {
      submitLoading.value = false
    }
  }

  async function doUploadPhoto(file) {
    return uploadPhoto(file)
  }

  // ─── Poster ───────────────────────────────────────────

  const poster = ref(null)
  const posterLoading = ref(false)

  async function loadPoster(slug) {
    posterLoading.value = true
    try {
      poster.value = await fetchPoster(slug)
    } finally {
      posterLoading.value = false
    }
  }

  // ─── Badges ───────────────────────────────────────────

  const badges = ref([])
  const badgesLoading = ref(false)

  async function loadBadges() {
    badgesLoading.value = true
    try {
      const data = await fetchBadges()
      badges.value = data.badges || data || []
    } finally {
      badgesLoading.value = false
    }
  }

  // ─── Auth convenience ─────────────────────────────────

  const loggedIn = computed(() => isLoggedIn())

  // ─── Reset ────────────────────────────────────────────

  function resetTaskState() {
    currentTask.value = null
    progress.value = null
    currentSubTask.value = null
    totalSubTasks.value = 0
    submitResult.value = null
    poster.value = null
  }

  return {
    // Task list
    taskList, taskListTotal, taskListPage, taskListLoading, taskListCity,
    loadTasks,

    // Task detail
    currentTask, taskLoading,
    loadTaskDetail,

    // Progress
    progress, currentSubTask, totalSubTasks,
    progressLoading, submitLoading, submitResult,
    isTaskCompleted, currentIndex,
    doStartTask, loadProgress, doSubmit, doUploadPhoto,

    // Poster
    poster, posterLoading,
    loadPoster,

    // Badges
    badges, badgesLoading,
    loadBadges,

    // Auth
    loggedIn,

    // Util
    resetTaskState,
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add app/src/stores/explore.js
git commit -m "feat(explore): Pinia store for explore module state management"
```

---

### Task 3: Explore CSS + Theme

**Files:**
- Create: `app/src/styles/explore.css`

- [ ] **Step 1: Create explore-specific styles**

Create `app/src/styles/explore.css`:

```css
/* ============================================
   Exploration Task Module — Styles
   ============================================ */

/* ─── Layout ─────────────────────────────────── */

.explore-page {
  min-height: 100vh;
  padding: var(--spacing-md);
  background-color: #1a1a1a;
  color: #e8e0d4;
}

.explore-page .page-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) 0;
}

.explore-page .back-btn {
  background: none;
  border: none;
  color: #8a7e6e;
  font-size: 1.2rem;
  cursor: pointer;
  padding: var(--spacing-xs);
  line-height: 1;
  -webkit-tap-highlight-color: transparent;
}

.explore-page .page-title {
  font-family: var(--font-body);
  font-size: 1.2rem;
  font-weight: 600;
  color: #e8e0d4;
  letter-spacing: 0.05em;
}

/* ─── Task Card ──────────────────────────────── */

.task-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #2c2c2c;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.task-card:active {
  transform: scale(0.98);
}

.task-card__cover {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.task-card__cover-placeholder {
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, #2c2c2c 0%, #3a3a3a 50%, #2c2c2c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #5a5a5a;
}

.task-card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 160px;
  background: linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
  pointer-events: none;
}

.task-card__body {
  padding: var(--spacing-md);
}

.task-card__title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #e8e0d4;
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
}

.task-card__meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: #8a7e6e;
}

.task-card__meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

.task-card__difficulty {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.task-card__difficulty--easy {
  background: rgba(74, 124, 89, 0.2);
  color: #6abf7b;
}

.task-card__difficulty--medium {
  background: rgba(201, 169, 110, 0.2);
  color: #c9a96e;
}

.task-card__difficulty--hard {
  background: rgba(204, 68, 68, 0.2);
  color: #cc6b6b;
}

.task-card__completions {
  font-size: 0.7rem;
  color: #5a5a5a;
}

/* ─── Difficulty Badge (shared) ──────────────── */

.diff-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.diff-badge--easy {
  background: rgba(74, 124, 89, 0.2);
  color: #6abf7b;
}

.diff-badge--medium {
  background: rgba(201, 169, 110, 0.2);
  color: #c9a96e;
}

.diff-badge--hard {
  background: rgba(204, 68, 68, 0.2);
  color: #cc6b6b;
}

/* ─── Task Detail Hero ───────────────────────── */

.task-hero {
  position: relative;
  margin: calc(-1 * var(--spacing-md));
  margin-bottom: var(--spacing-lg);
}

.task-hero__image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.task-hero__image-placeholder {
  width: 100%;
  height: 220px;
  background: linear-gradient(135deg, #2c2c2c 0%, #3a3a3a 50%, #2c2c2c 100%);
}

.task-hero__gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to bottom, transparent, #1a1a1a);
}

.task-hero__back {
  position: absolute;
  top: var(--spacing-md);
  left: var(--spacing-md);
  background: rgba(0, 0, 0, 0.4);
  border: none;
  color: #e8e0d4;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  backdrop-filter: blur(4px);
  -webkit-tap-highlight-color: transparent;
}

/* ─── Task Info Section ──────────────────────── */

.task-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.task-info__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e8e0d4;
  line-height: 1.3;
}

.task-info__desc {
  font-size: 0.9rem;
  color: #8a7e6e;
  line-height: 1.8;
}

.task-info__stats {
  display: flex;
  gap: var(--spacing-lg);
}

.task-info__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.task-info__stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e8e0d4;
}

.task-info__stat-label {
  font-size: 0.7rem;
  color: #5a5a5a;
  letter-spacing: 0.04em;
}

.task-info__locations {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.task-info__location-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.85rem;
  color: #8a7e6e;
}

.task-info__location-icon {
  color: #c9a96e;
  flex-shrink: 0;
}

/* ─── CTA Button (large) ────────────────────── */

.cta-btn {
  display: block;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.2s ease, transform 0.1s ease;
  -webkit-tap-highlight-color: transparent;
}

.cta-btn--primary {
  background: linear-gradient(135deg, #c9a96e 0%, #a8864e 100%);
  color: #1a1a1a;
}

.cta-btn--primary:active {
  transform: scale(0.97);
}

.cta-btn--primary:disabled {
  background: #3a3a3a;
  color: #5a5a5a;
  cursor: not-allowed;
  transform: none;
}

.cta-btn--continue {
  background: linear-gradient(135deg, #4a7c59 0%, #3a6648 100%);
  color: #e8e0d4;
}

.cta-btn--continue:active {
  transform: scale(0.97);
}

/* ─── Sub-Task Progress Chain ────────────────── */

.progress-chain {
  display: flex;
  align-items: center;
  gap: 0;
  padding: var(--spacing-md) 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.progress-chain::-webkit-scrollbar {
  display: none;
}

.progress-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  min-width: 36px;
}

.progress-node__dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.progress-node--done .progress-node__dot {
  background: #4a7c59;
  color: #e8e0d4;
}

.progress-node--current .progress-node__dot {
  background: #c9a96e;
  color: #1a1a1a;
  box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.3);
  animation: pulse-glow 2s ease-in-out infinite;
}

.progress-node--locked .progress-node__dot {
  background: #2c2c2c;
  color: #5a5a5a;
  border: 1px solid #3a3a3a;
}

.progress-node__label {
  font-size: 0.55rem;
  color: #5a5a5a;
  max-width: 48px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-connector {
  width: 20px;
  height: 2px;
  flex-shrink: 0;
}

.progress-connector--done {
  background: #4a7c59;
}

.progress-connector--pending {
  background: #3a3a3a;
}

/* ─── Play Page ──────────────────────────────── */

.play-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  color: #e8e0d4;
}

.play-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-bottom: 1px solid #2c2c2c;
}

.play-header__back {
  background: none;
  border: none;
  color: #8a7e6e;
  font-size: 1.1rem;
  cursor: pointer;
  padding: var(--spacing-xs);
  -webkit-tap-highlight-color: transparent;
}

.play-header__title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #8a7e6e;
  flex: 1;
  text-align: center;
}

.play-content {
  flex: 1;
  padding: var(--spacing-lg) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.play-instruction {
  font-size: 0.95rem;
  color: #c4b59a;
  line-height: 1.8;
  background: #222;
  border-left: 3px solid #c9a96e;
  padding: var(--spacing-md);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.play-location {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(201, 169, 110, 0.08);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: #c9a96e;
}

.play-footer {
  padding: var(--spacing-md);
  border-top: 1px solid #2c2c2c;
}

/* ─── Submit feedback ────────────────────────── */

.submit-feedback {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  animation: fade-in 0.3s ease;
}

.submit-feedback--success {
  background: rgba(74, 124, 89, 0.15);
  border: 1px solid rgba(74, 124, 89, 0.3);
  color: #6abf7b;
}

.submit-feedback--fail {
  background: rgba(204, 68, 68, 0.1);
  border: 1px solid rgba(204, 68, 68, 0.2);
  color: #cc6b6b;
}

.submit-feedback__title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.submit-feedback__text {
  font-size: 0.85rem;
  opacity: 0.8;
}

/* ─── Photo Submit ───────────────────────────── */

.photo-submit__preview {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.photo-submit__preview img {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  display: block;
}

.photo-submit__camera-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  height: 180px;
  background: #222;
  border: 2px dashed #3a3a3a;
  border-radius: var(--radius-md);
  color: #8a7e6e;
  cursor: pointer;
  transition: border-color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.photo-submit__camera-btn:active {
  border-color: #c9a96e;
}

.photo-submit__camera-icon {
  font-size: 2rem;
}

.photo-submit__camera-text {
  font-size: 0.85rem;
}

/* ─── Arrival Check ──────────────────────────── */

.arrival-check__target {
  padding: var(--spacing-md);
  background: rgba(201, 169, 110, 0.08);
  border-radius: var(--radius-md);
  text-align: center;
}

.arrival-check__target-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e8e0d4;
  margin-bottom: var(--spacing-xs);
}

.arrival-check__target-addr {
  font-size: 0.8rem;
  color: #8a7e6e;
}

.arrival-check__distance {
  text-align: center;
  font-size: 0.85rem;
  color: #8a7e6e;
  padding: var(--spacing-sm) 0;
}

/* ─── Quiz Input ─────────────────────────────── */

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: #222;
  border: 1px solid #3a3a3a;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.quiz-option:active {
  transform: scale(0.98);
}

.quiz-option--selected {
  border-color: #c9a96e;
  background: rgba(201, 169, 110, 0.08);
}

.quiz-option--correct {
  border-color: #4a7c59;
  background: rgba(74, 124, 89, 0.1);
}

.quiz-option--wrong {
  border-color: #cc4444;
  background: rgba(204, 68, 68, 0.08);
}

.quiz-option__marker {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #5a5a5a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: #8a7e6e;
  flex-shrink: 0;
}

.quiz-option--selected .quiz-option__marker {
  border-color: #c9a96e;
  color: #c9a96e;
}

.quiz-option__text {
  font-size: 0.9rem;
  color: #e8e0d4;
  line-height: 1.5;
}

/* ─── Puzzle Input ───────────────────────────── */

.puzzle-input__row {
  display: flex;
  gap: var(--spacing-sm);
}

.puzzle-input__field {
  flex: 1;
  padding: 14px var(--spacing-md);
  background: #222;
  border: 1px solid #3a3a3a;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 1rem;
  color: #e8e0d4;
  outline: none;
  transition: border-color 0.2s ease;
}

.puzzle-input__field:focus {
  border-color: #c9a96e;
}

.puzzle-input__field::placeholder {
  color: #5a5a5a;
}

.puzzle-input__submit {
  flex-shrink: 0;
  padding: 14px var(--spacing-lg);
  background: #c9a96e;
  border: none;
  border-radius: var(--radius-sm);
  color: #1a1a1a;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.puzzle-input__submit:disabled {
  background: #3a3a3a;
  color: #5a5a5a;
  cursor: not-allowed;
}

/* ─── Badge Card ─────────────────────────────── */

.badge-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: #2c2c2c;
  border-radius: var(--radius-md);
  text-align: center;
  transition: transform 0.2s ease;
}

.badge-card--unlocked {
  border: 1px solid rgba(201, 169, 110, 0.2);
}

.badge-card--locked {
  opacity: 0.5;
}

.badge-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
  font-family: var(--font-display);
}

.badge-card--unlocked .badge-card__icon {
  box-shadow: 0 0 12px rgba(201, 169, 110, 0.2);
}

.badge-card--locked .badge-card__icon {
  background: #3a3a3a;
  color: #5a5a5a;
  border: 1px solid #4a4a4a;
}

.badge-card__name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e8e0d4;
}

.badge-card__task {
  font-size: 0.7rem;
  color: #8a7e6e;
}

.badge-card__date {
  font-size: 0.65rem;
  color: #5a5a5a;
}

/* ─── Poster ─────────────────────────────────── */

.poster-view {
  min-height: 100vh;
  background: #1a1a1a;
  color: #e8e0d4;
  padding: var(--spacing-md);
}

.poster-canvas {
  background: linear-gradient(145deg, #2c2c2c 0%, #222 100%);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: var(--spacing-lg);
}

.poster-canvas__title {
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  color: #e8e0d4;
  margin-bottom: var(--spacing-lg);
}

.poster-canvas__photos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.poster-canvas__photo {
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-sm);
  width: 100%;
}

.poster-canvas__stats {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-md) 0;
  border-top: 1px solid #3a3a3a;
  border-bottom: 1px solid #3a3a3a;
  margin-bottom: var(--spacing-md);
}

.poster-canvas__stat {
  text-align: center;
}

.poster-canvas__stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #c9a96e;
}

.poster-canvas__stat-label {
  font-size: 0.65rem;
  color: #5a5a5a;
  margin-top: 2px;
}

.poster-canvas__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) 0;
}

.poster-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

/* ─── Loading spinner ────────────────────────── */

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.loading-spinner__ring {
  width: 32px;
  height: 32px;
  border: 3px solid #3a3a3a;
  border-top-color: #c9a96e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ─── Empty state ────────────────────────────── */

.empty-state {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-md);
  color: #5a5a5a;
}

.empty-state__icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-sm);
}

.empty-state__text {
  font-size: 0.9rem;
}

/* ─── City filter pills ──────────────────────── */

.filter-pills {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding: var(--spacing-sm) 0;
  -webkit-overflow-scrolling: touch;
}

.filter-pills::-webkit-scrollbar {
  display: none;
}

.filter-pill {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 16px;
  border: 1px solid #3a3a3a;
  background: transparent;
  color: #8a7e6e;
  font-family: var(--font-body);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.filter-pill--active {
  background: rgba(201, 169, 110, 0.15);
  border-color: #c9a96e;
  color: #c9a96e;
}

/* ─── Auth prompt ────────────────────────────── */

.auth-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  text-align: center;
  min-height: 50vh;
}

.auth-prompt__text {
  font-size: 1rem;
  color: #8a7e6e;
}

.auth-prompt__hint {
  font-size: 0.8rem;
  color: #5a5a5a;
}
```

- [ ] **Step 2: Import explore.css in main.js**

Modify `app/src/main.js` — add the import after the theme.css import:

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router.js'
import './styles/theme.css'
import './styles/explore.css'
import { migrateFromV1 } from './utils/migration.js'

migrateFromV1()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

- [ ] **Step 3: Commit**

```bash
git add app/src/styles/explore.css app/src/main.js
git commit -m "feat(explore): explore module CSS styles and theme"
```

---

### Task 4: Vue Router — New Routes + Auth Guard

**Files:**
- Modify: `app/src/router.js`

- [ ] **Step 1: Add explore routes and auth guard**

Replace the entire `app/src/router.js` with:

```javascript
// app/src/router.js

import { createRouter, createWebHashHistory } from 'vue-router'
import { useGameStore } from './stores/game.js'
import { usePlatformStore } from './stores/platform.js'
import { CITY_IDS } from './data/cities/index.js'
import { isLoggedIn } from './services/explore-api.js'

const routes = [
  {
    path: '/',
    name: 'PlatformHome',
    component: () => import('./pages/PlatformHome.vue')
  },
  {
    path: '/city/:cityId',
    name: 'CityHome',
    component: () => import('./pages/Home.vue'),
    props: true
  },
  {
    path: '/city/:cityId/prologue',
    name: 'Prologue',
    component: () => import('./pages/Prologue.vue'),
    props: true
  },
  {
    path: '/city/:cityId/stage/:id',
    name: 'Stage',
    component: () => import('./pages/Stage.vue'),
    props: true
  },
  {
    path: '/city/:cityId/transit/:from/:to',
    name: 'Transit',
    component: () => import('./pages/Transit.vue'),
    props: true
  },
  {
    path: '/city/:cityId/finale',
    name: 'Finale',
    component: () => import('./pages/Finale.vue'),
    props: true
  },
  {
    path: '/city/:cityId/archive',
    name: 'Archive',
    component: () => import('./pages/Archive.vue'),
    props: true
  },
  {
    path: '/cross-city-reveal',
    name: 'CrossCityReveal',
    component: () => import('./pages/CrossCityReveal.vue')
  },

  // ─── Explore module routes ──────────────────────────
  {
    path: '/explore',
    name: 'TaskList',
    component: () => import('./pages/TaskList.vue'),
  },
  {
    path: '/explore/:slug',
    name: 'TaskDetail',
    component: () => import('./pages/TaskDetail.vue'),
    props: true,
  },
  {
    path: '/explore/:slug/play',
    name: 'TaskPlay',
    component: () => import('./pages/TaskPlay.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/explore/:slug/poster',
    name: 'PosterView',
    component: () => import('./pages/PosterView.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/badges',
    name: 'BadgeCollection',
    component: () => import('./pages/BadgeCollection.vue'),
    meta: { requiresAuth: true },
  },

  // Backward compatibility redirects (old Shanghai URLs)
  {
    path: '/stage/:id',
    redirect: (to) => `/city/shanghai/stage/${to.params.id}`
  },
  {
    path: '/transit/:from/:to',
    redirect: (to) => `/city/shanghai/transit/${to.params.from}/${to.params.to}`
  },
  {
    path: '/finale',
    redirect: '/city/shanghai/finale'
  },
  {
    path: '/archive',
    redirect: '/city/shanghai/archive'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  // Auth guard for explore module
  if (to.meta.requiresAuth && !isLoggedIn()) {
    // Redirect to explore list with a login prompt query
    return { path: '/explore', query: { login: '1' } }
  }

  if (to.path === '/') return true

  if (to.name === 'CrossCityReveal') {
    const platform = usePlatformStore()
    if (!platform.allCitiesCompleted) return '/'
    return true
  }

  // Explore routes don't need city validation
  if (to.path.startsWith('/explore') || to.path === '/badges') return true

  const cityId = to.params.cityId
  if (!cityId) return true

  if (!CITY_IDS.includes(cityId)) {
    return '/'
  }

  const game = useGameStore(cityId)

  if (to.name === 'CityHome') return true

  if (to.name === 'Prologue') {
    if (game.currentStage === 0) return true
    return `/city/${cityId}`
  }

  if (to.name === 'Stage') {
    const stageId = parseInt(to.params.id)
    if (game.currentStage >= stageId) return true
    return `/city/${cityId}`
  }

  if (to.name === 'Transit') {
    const from = parseInt(to.params.from)
    if (game.currentStage >= from) return true
    return `/city/${cityId}`
  }

  if (to.name === 'Finale') {
    if (game.currentStage >= 8) return true
    return `/city/${cityId}`
  }

  if (to.name === 'Archive') {
    if (game.currentStage >= 9) return true
    return `/city/${cityId}`
  }

  return true
})

export default router
```

- [ ] **Step 2: Verify routes register**

Start the dev server and navigate to `http://localhost:3000/#/explore` — should show a blank page (component not built yet) without errors in the console.

- [ ] **Step 3: Commit**

```bash
git add app/src/router.js
git commit -m "feat(explore): add explore routes with auth guard to Vue Router"
```

---

### Task 5: TaskCard Component

**Files:**
- Create: `app/src/components/TaskCard.vue`

- [ ] **Step 1: Create TaskCard component**

Create `app/src/components/TaskCard.vue`:

```vue
<template>
  <div class="task-card" @click="$emit('click')">
    <img
      v-if="task.coverImage"
      :src="task.coverImage"
      :alt="task.title"
      class="task-card__cover"
      loading="lazy"
    />
    <div v-else class="task-card__cover-placeholder">
      <span>&#x1F9ED;</span>
    </div>
    <div class="task-card__overlay"></div>

    <div class="task-card__body">
      <h3 class="task-card__title">{{ task.title }}</h3>
      <div class="task-card__meta">
        <span
          v-if="task.difficulty"
          class="task-card__difficulty"
          :class="`task-card__difficulty--${task.difficulty}`"
        >
          {{ difficultyLabel }}
        </span>
        <span v-if="task.locationSummary" class="task-card__meta-item">
          &#x1F4CD; {{ task.locationSummary }}
        </span>
        <span v-if="task.estimatedMinutes" class="task-card__meta-item">
          &#x23F1; {{ task.estimatedMinutes }}min
        </span>
      </div>
      <div v-if="task.completionCount > 0" class="task-card__completions">
        {{ task.completionCount }} 人已完成
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

defineEmits(['click'])

const DIFFICULTY_MAP = { easy: '轻松', medium: '适中', hard: '挑战' }

const difficultyLabel = computed(() =>
  DIFFICULTY_MAP[props.task.difficulty] || props.task.difficulty
)
</script>
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/TaskCard.vue
git commit -m "feat(explore): TaskCard component for task list"
```

---

### Task 6: SubTaskProgress Component

**Files:**
- Create: `app/src/components/SubTaskProgress.vue`

- [ ] **Step 1: Create SubTaskProgress component**

Create `app/src/components/SubTaskProgress.vue`:

```vue
<template>
  <div class="progress-chain">
    <template v-for="(node, i) in nodes" :key="i">
      <div
        v-if="i > 0"
        class="progress-connector"
        :class="i <= currentIndex ? 'progress-connector--done' : 'progress-connector--pending'"
      ></div>
      <div
        class="progress-node"
        :class="{
          'progress-node--done': node.state === 'done',
          'progress-node--current': node.state === 'current',
          'progress-node--locked': node.state === 'locked',
        }"
      >
        <div class="progress-node__dot">
          <template v-if="node.state === 'done'">&#x2713;</template>
          <template v-else-if="node.state === 'current'">&#x25B8;</template>
          <template v-else>&#x1F512;</template>
        </div>
        <div class="progress-node__label">{{ node.label }}</div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    required: true,
  },
  currentIndex: {
    type: Number,
    required: true,
  },
  labels: {
    type: Array,
    default: () => [],
  },
})

const nodes = computed(() => {
  const result = []
  for (let i = 1; i <= props.total; i++) {
    let state
    if (i < props.currentIndex) {
      state = 'done'
    } else if (i === props.currentIndex) {
      state = 'current'
    } else {
      state = 'locked'
    }
    result.push({
      index: i,
      state,
      label: props.labels[i - 1] || `${i}`,
    })
  }
  return result
})
</script>
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/SubTaskProgress.vue
git commit -m "feat(explore): SubTaskProgress horizontal chain component"
```

---

### Task 7: PhotoSubmit Component

**Files:**
- Create: `app/src/components/PhotoSubmit.vue`

- [ ] **Step 1: Create PhotoSubmit component**

Create `app/src/components/PhotoSubmit.vue`:

```vue
<template>
  <div class="photo-submit">
    <!-- Preview uploaded photo -->
    <div v-if="previewUrl" class="photo-submit__preview animate-fade-in">
      <img :src="previewUrl" alt="提交的照片" />
    </div>

    <!-- Camera button -->
    <label v-else class="photo-submit__camera-btn">
      <span class="photo-submit__camera-icon">&#x1F4F7;</span>
      <span class="photo-submit__camera-text">拍摄或选择照片</span>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        style="display: none"
        @change="handleFile"
      />
    </label>

    <!-- Upload progress / AI verification -->
    <div v-if="uploading" class="loading-spinner">
      <div class="loading-spinner__ring"></div>
    </div>

    <div v-if="verifyResult" class="submit-feedback" :class="feedbackClass">
      <p class="submit-feedback__title">{{ verifyResult.approved ? '验证通过' : '验证未通过' }}</p>
      <p class="submit-feedback__text">{{ verifyResult.reason || '' }}</p>
    </div>

    <!-- Submit button (shown after photo selected and uploaded) -->
    <button
      v-if="uploadedUrl && !verifyResult"
      class="cta-btn cta-btn--primary"
      :disabled="uploading"
      @click="handleSubmit"
    >
      提交照片
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useExploreStore } from '../stores/explore.js'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['submitted'])

const store = useExploreStore()

const fileInput = ref(null)
const previewUrl = ref(null)
const uploadedUrl = ref(null)
const uploading = ref(false)
const verifyResult = ref(null)

const feedbackClass = computed(() =>
  verifyResult.value?.approved ? 'submit-feedback--success' : 'submit-feedback--fail'
)

async function handleFile(event) {
  const file = event.target.files?.[0]
  if (!file) return

  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true

  try {
    const result = await store.doUploadPhoto(file)
    uploadedUrl.value = result.url
  } catch (err) {
    console.error('Upload failed:', err)
    previewUrl.value = null
  } finally {
    uploading.value = false
  }
}

async function handleSubmit() {
  if (!uploadedUrl.value) return
  uploading.value = true

  try {
    const result = await store.doSubmit(props.slug, {
      photoUrl: uploadedUrl.value,
    })
    verifyResult.value = {
      approved: result.approved,
      reason: result.aiResult?.reason || '',
    }

    if (result.approved) {
      setTimeout(() => {
        emit('submitted', result)
      }, 1500)
    }
  } catch (err) {
    verifyResult.value = { approved: false, reason: err.message }
  } finally {
    uploading.value = false
  }
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/PhotoSubmit.vue
git commit -m "feat(explore): PhotoSubmit component with upload and AI verification"
```

---

### Task 8: ArrivalCheck Component

**Files:**
- Create: `app/src/components/ArrivalCheck.vue`

- [ ] **Step 1: Create ArrivalCheck component**

Create `app/src/components/ArrivalCheck.vue`:

```vue
<template>
  <div class="arrival-check">
    <div class="arrival-check__target">
      <p class="arrival-check__target-name">{{ locationName }}</p>
      <p v-if="locationAddress" class="arrival-check__target-addr">{{ locationAddress }}</p>
    </div>

    <div v-if="distance !== null" class="arrival-check__distance">
      &#x1F4CD; 距目标 {{ formatDistance(distance) }}
    </div>

    <!-- GPS verification feedback -->
    <div v-if="verifyResult" class="submit-feedback" :class="feedbackClass">
      <p class="submit-feedback__title">{{ verifyResult.approved ? '已确认到达' : '距离太远' }}</p>
      <p class="submit-feedback__text">{{ verifyResult.reason || '' }}</p>
    </div>

    <div v-if="gpsError" class="submit-feedback submit-feedback--fail">
      <p class="submit-feedback__title">定位失败</p>
      <p class="submit-feedback__text">{{ gpsError }}</p>
    </div>

    <div v-if="checking" class="loading-spinner">
      <div class="loading-spinner__ring"></div>
    </div>

    <button
      v-if="!verifyResult || !verifyResult.approved"
      class="cta-btn cta-btn--primary"
      :disabled="checking"
      @click="checkArrival"
    >
      {{ checking ? '定位中...' : '我已到达' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useExploreStore } from '../stores/explore.js'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
  locationName: {
    type: String,
    required: true,
  },
  locationAddress: {
    type: String,
    default: '',
  },
  targetLat: {
    type: Number,
    default: null,
  },
  targetLng: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['submitted'])

const store = useExploreStore()

const checking = ref(false)
const distance = ref(null)
const gpsError = ref(null)
const verifyResult = ref(null)

const feedbackClass = computed(() =>
  verifyResult.value?.approved ? 'submit-feedback--success' : 'submit-feedback--fail'
)

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

function getGeoPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        const messages = {
          1: '请允许定位权限',
          2: '无法获取位置',
          3: '定位超时，请重试',
        }
        reject(new Error(messages[err.code] || '定位失败'))
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  })
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000 // Earth radius in meters
  const toRad = (v) => (v * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function checkArrival() {
  checking.value = true
  gpsError.value = null
  verifyResult.value = null

  try {
    const pos = await getGeoPosition()

    // Calculate distance if target coordinates available
    if (props.targetLat && props.targetLng) {
      distance.value = haversineDistance(pos.lat, pos.lng, props.targetLat, props.targetLng)
    }

    // Submit to backend for verification — field names must match backend (gpsLat/gpsLng)
    const result = await store.doSubmit(props.slug, {
      gpsLat: pos.lat,
      gpsLng: pos.lng,
    })

    verifyResult.value = {
      approved: result.approved,
      reason: result.approved ? '' : '请更靠近目标位置后重试',
    }

    if (result.approved) {
      setTimeout(() => {
        emit('submitted', result)
      }, 1500)
    }
  } catch (err) {
    if (err.name === 'ApiError') {
      verifyResult.value = { approved: false, reason: err.message }
    } else {
      gpsError.value = err.message
    }
  } finally {
    checking.value = false
  }
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/ArrivalCheck.vue
git commit -m "feat(explore): ArrivalCheck component with GPS verification"
```

---

### Task 9: PuzzleInput Component

**Files:**
- Create: `app/src/components/PuzzleInput.vue`

- [ ] **Step 1: Create PuzzleInput component**

Create `app/src/components/PuzzleInput.vue`:

```vue
<template>
  <div class="puzzle-input">
    <div class="puzzle-input__row">
      <input
        v-model="answer"
        type="text"
        class="puzzle-input__field"
        placeholder="请输入答案"
        :disabled="!!verifyResult?.approved"
        @keyup.enter="handleSubmit"
      />
      <button
        class="puzzle-input__submit"
        :disabled="!answer.trim() || submitting || !!verifyResult?.approved"
        @click="handleSubmit"
      >
        {{ submitting ? '...' : '提交' }}
      </button>
    </div>

    <div v-if="submitting" class="loading-spinner" style="padding: 12px">
      <div class="loading-spinner__ring"></div>
    </div>

    <div v-if="verifyResult" class="submit-feedback" :class="feedbackClass">
      <p class="submit-feedback__title">{{ verifyResult.approved ? '回答正确' : '回答有误' }}</p>
      <p v-if="verifyResult.reason" class="submit-feedback__text">{{ verifyResult.reason }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useExploreStore } from '../stores/explore.js'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['submitted'])

const store = useExploreStore()

const answer = ref('')
const submitting = ref(false)
const verifyResult = ref(null)

const feedbackClass = computed(() =>
  verifyResult.value?.approved ? 'submit-feedback--success' : 'submit-feedback--fail'
)

async function handleSubmit() {
  if (!answer.value.trim() || submitting.value) return

  submitting.value = true
  verifyResult.value = null

  try {
    const result = await store.doSubmit(props.slug, {
      answerText: answer.value.trim(),
    })

    verifyResult.value = {
      approved: result.approved,
      reason: result.approved ? '' : '再想想，答案不太对',
    }

    if (result.approved) {
      setTimeout(() => {
        emit('submitted', result)
      }, 1200)
    } else {
      // Clear for retry after delay
      setTimeout(() => {
        verifyResult.value = null
      }, 2500)
    }
  } catch (err) {
    verifyResult.value = { approved: false, reason: err.message }
  } finally {
    submitting.value = false
  }
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/PuzzleInput.vue
git commit -m "feat(explore): PuzzleInput component for text answer subtasks"
```

---

### Task 10: QuizInput Component

**Files:**
- Create: `app/src/components/QuizInput.vue`

- [ ] **Step 1: Create QuizInput component**

Create `app/src/components/QuizInput.vue`:

```vue
<template>
  <div class="quiz-input">
    <div class="quiz-options">
      <div
        v-for="(option, i) in options"
        :key="i"
        class="quiz-option"
        :class="{
          'quiz-option--selected': selectedIndex === i && !verifyResult,
          'quiz-option--correct': verifyResult?.approved && selectedIndex === i,
          'quiz-option--wrong': verifyResult && !verifyResult.approved && selectedIndex === i,
        }"
        @click="selectOption(i)"
      >
        <span class="quiz-option__marker">{{ MARKERS[i] }}</span>
        <span class="quiz-option__text">{{ option }}</span>
      </div>
    </div>

    <div v-if="submitting" class="loading-spinner" style="padding: 12px">
      <div class="loading-spinner__ring"></div>
    </div>

    <div v-if="verifyResult" class="submit-feedback" :class="feedbackClass">
      <p class="submit-feedback__title">{{ verifyResult.approved ? '回答正确' : '回答有误' }}</p>
      <p v-if="verifyResult.reason" class="submit-feedback__text">{{ verifyResult.reason }}</p>
    </div>

    <button
      v-if="selectedIndex !== null && !verifyResult && !submitting"
      class="cta-btn cta-btn--primary"
      @click="handleSubmit"
    >
      确认选择
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useExploreStore } from '../stores/explore.js'

const MARKERS = ['A', 'B', 'C', 'D']

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['submitted'])

const store = useExploreStore()

const selectedIndex = ref(null)
const submitting = ref(false)
const verifyResult = ref(null)

const feedbackClass = computed(() =>
  verifyResult.value?.approved ? 'submit-feedback--success' : 'submit-feedback--fail'
)

function selectOption(index) {
  if (verifyResult.value) return
  selectedIndex.value = index
}

async function handleSubmit() {
  if (selectedIndex.value === null || submitting.value) return

  submitting.value = true
  verifyResult.value = null

  try {
    const result = await store.doSubmit(props.slug, {
      selectedIndex: selectedIndex.value,
    })

    verifyResult.value = {
      approved: result.approved,
      reason: result.approved ? '' : '不是这个，再看看',
    }

    if (result.approved) {
      setTimeout(() => {
        emit('submitted', result)
      }, 1200)
    } else {
      setTimeout(() => {
        verifyResult.value = null
        selectedIndex.value = null
      }, 2500)
    }
  } catch (err) {
    verifyResult.value = { approved: false, reason: err.message }
  } finally {
    submitting.value = false
  }
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/QuizInput.vue
git commit -m "feat(explore): QuizInput multiple choice component"
```

---

### Task 11: BadgeCard Component

**Files:**
- Create: `app/src/components/BadgeCard.vue`

- [ ] **Step 1: Create BadgeCard component**

Create `app/src/components/BadgeCard.vue`:

```vue
<template>
  <div class="badge-card" :class="badge.unlocked ? 'badge-card--unlocked' : 'badge-card--locked'">
    <div
      class="badge-card__icon"
      :style="badge.unlocked ? {
        background: `${badge.badgeColor}22`,
        color: badge.badgeColor,
        border: `2px solid ${badge.badgeColor}`,
      } : {}"
    >
      <template v-if="badge.unlocked">{{ badge.badgeIcon }}</template>
      <template v-else>&#x1F512;</template>
    </div>
    <div class="badge-card__name">
      {{ badge.unlocked ? badge.badgeName : '未解锁' }}
    </div>
    <div class="badge-card__task">
      {{ badge.taskTitle || '' }}
    </div>
    <div v-if="badge.unlocked && badge.unlockedAt" class="badge-card__date">
      {{ formatDate(badge.unlockedAt) }}
    </div>
    <div v-if="!badge.unlocked" class="badge-card__date">
      完成任务即可解锁
    </div>
  </div>
</template>

<script setup>
defineProps({
  badge: {
    type: Object,
    required: true,
  },
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/BadgeCard.vue
git commit -m "feat(explore): BadgeCard component for locked/unlocked states"
```

---

### Task 12: PosterCanvas Component

**Files:**
- Create: `app/src/components/PosterCanvas.vue`

- [ ] **Step 1: Create PosterCanvas component**

Create `app/src/components/PosterCanvas.vue`:

```vue
<template>
  <div ref="canvasRef" class="poster-canvas">
    <h2 class="poster-canvas__title">{{ poster.taskTitle }}</h2>

    <div v-if="poster.photos && poster.photos.length" class="poster-canvas__photos">
      <img
        v-for="(photo, i) in poster.photos"
        :key="i"
        :src="photo"
        class="poster-canvas__photo"
        crossorigin="anonymous"
      />
    </div>

    <div class="poster-canvas__stats">
      <div class="poster-canvas__stat">
        <div class="poster-canvas__stat-value">{{ poster.completionRank || '-' }}</div>
        <div class="poster-canvas__stat-label">完成排名</div>
      </div>
      <div class="poster-canvas__stat">
        <div class="poster-canvas__stat-value">{{ poster.subTaskCount || '-' }}</div>
        <div class="poster-canvas__stat-label">任务步骤</div>
      </div>
      <div class="poster-canvas__stat">
        <div class="poster-canvas__stat-value">{{ formatDuration(poster.durationMinutes) }}</div>
        <div class="poster-canvas__stat-label">用时</div>
      </div>
    </div>

    <div v-if="poster.badgeName" class="poster-canvas__badge">
      <span
        :style="{ color: poster.badgeColor, fontSize: '1.4rem', fontWeight: 700 }"
      >{{ poster.badgeIcon }}</span>
      <span style="color: #c9a96e; font-weight: 600;">{{ poster.badgeName }}</span>
    </div>

    <p style="text-align: center; font-size: 0.7rem; color: #5a5a5a; margin-top: 8px;">
      读城 · 探索任务
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  poster: {
    type: Object,
    required: true,
  },
})

const canvasRef = ref(null)

function formatDuration(minutes) {
  if (!minutes) return '-'
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h${m}m` : `${h}h`
}

/**
 * Export the poster as a canvas image for download.
 * Uses html2canvas-style approach via a temporary canvas.
 */
async function toDataUrl() {
  // Dynamic import to avoid bundling html2canvas unless needed
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(canvasRef.value, {
    backgroundColor: '#222',
    scale: 2,
    useCORS: true,
  })
  return canvas.toDataURL('image/png')
}

defineExpose({ toDataUrl })
</script>
```

Note: This component uses an optional dynamic import of `html2canvas` for the download feature. It needs to be installed:

```bash
cd app && npm install html2canvas
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/PosterCanvas.vue
git commit -m "feat(explore): PosterCanvas component with export support"
```

---

### Task 13: TaskList Page

**Files:**
- Create: `app/src/pages/TaskList.vue`

- [ ] **Step 1: Create TaskList page**

Create `app/src/pages/TaskList.vue`:

```vue
<template>
  <div class="explore-page">
    <header class="page-header">
      <button class="back-btn" @click="router.push('/')">&#x2190;</button>
      <h1 class="page-title">探索任务</h1>
    </header>

    <!-- Auth prompt (shown when redirected with login=1) -->
    <div v-if="showLoginPrompt" class="auth-prompt">
      <p class="auth-prompt__text">请先登录后再开始任务</p>
      <p class="auth-prompt__hint">登录后可开始探索、提交任务并收集徽章</p>
    </div>

    <!-- City filter -->
    <div class="filter-pills">
      <button
        class="filter-pill"
        :class="{ 'filter-pill--active': !selectedCity }"
        @click="filterByCity(null)"
      >
        全部
      </button>
      <button
        v-for="city in FILTER_CITIES"
        :key="city.id"
        class="filter-pill"
        :class="{ 'filter-pill--active': selectedCity === city.id }"
        @click="filterByCity(city.id)"
      >
        {{ city.name }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.taskListLoading && store.taskList.length === 0" class="loading-spinner">
      <div class="loading-spinner__ring"></div>
    </div>

    <!-- Task list -->
    <div v-else-if="store.taskList.length > 0" class="task-list">
      <TaskCard
        v-for="task in store.taskList"
        :key="task.id"
        :task="task"
        @click="goToTask(task.slug)"
      />

      <!-- Load more -->
      <button
        v-if="hasMore"
        class="cta-btn cta-btn--primary"
        style="margin-top: 8px;"
        :disabled="store.taskListLoading"
        @click="loadMore"
      >
        {{ store.taskListLoading ? '加载中...' : '加载更多' }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-state__icon">&#x1F30D;</div>
      <p class="empty-state__text">暂无探索任务</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExploreStore } from '../stores/explore.js'
import TaskCard from '../components/TaskCard.vue'

const FILTER_CITIES = [
  { id: 'shanghai', name: '上海' },
  { id: 'nanjing', name: '南京' },
  { id: 'hangzhou', name: '杭州' },
  { id: 'xian', name: '西安' },
  { id: 'suzhou', name: '苏州' },
]

const router = useRouter()
const route = useRoute()
const store = useExploreStore()

const selectedCity = ref(null)
const showLoginPrompt = ref(route.query.login === '1')

const hasMore = computed(() =>
  store.taskList.length < store.taskListTotal
)

onMounted(() => {
  store.loadTasks({ reset: true })
})

function filterByCity(city) {
  selectedCity.value = city
  store.loadTasks({ city, reset: true })
}

function loadMore() {
  store.loadTasks({
    city: selectedCity.value,
    page: store.taskListPage + 1,
  })
}

function goToTask(slug) {
  router.push(`/explore/${slug}`)
}
</script>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
}
</style>
```

- [ ] **Step 2: Verify TaskList page**

Start the dev server, open `http://localhost:3000/#/explore`. The page should render with the header, filter pills, and empty state (since no tasks exist in the database yet). No console errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/pages/TaskList.vue
git commit -m "feat(explore): TaskList page with city filter and task cards"
```

---

### Task 14: TaskDetail Page

**Files:**
- Create: `app/src/pages/TaskDetail.vue`

- [ ] **Step 1: Create TaskDetail page**

Create `app/src/pages/TaskDetail.vue`:

```vue
<template>
  <div class="explore-page" style="padding: 0;">
    <!-- Loading -->
    <div v-if="store.taskLoading" class="loading-spinner" style="min-height: 100vh;">
      <div class="loading-spinner__ring"></div>
    </div>

    <template v-else-if="task">
      <!-- Hero cover -->
      <div class="task-hero">
        <img
          v-if="task.coverImage"
          :src="task.coverImage"
          :alt="task.title"
          class="task-hero__image"
        />
        <div v-else class="task-hero__image-placeholder"></div>
        <div class="task-hero__gradient"></div>
        <button class="task-hero__back" @click="router.push('/explore')">&#x2190;</button>
      </div>

      <!-- Info -->
      <div style="padding: 0 var(--spacing-md) var(--spacing-lg);">
        <div class="task-info">
          <h1 class="task-info__title">{{ task.title }}</h1>

          <div class="task-info__stats">
            <div class="task-info__stat">
              <span class="task-info__stat-value">{{ task.totalSubTasks }}</span>
              <span class="task-info__stat-label">步骤</span>
            </div>
            <div class="task-info__stat">
              <span class="task-info__stat-value">{{ task.estimatedMinutes || '?' }}min</span>
              <span class="task-info__stat-label">预计用时</span>
            </div>
            <div v-if="task.difficulty" class="task-info__stat">
              <span :class="`diff-badge diff-badge--${task.difficulty}`">{{ difficultyLabel }}</span>
              <span class="task-info__stat-label">难度</span>
            </div>
            <div class="task-info__stat">
              <span class="task-info__stat-value">{{ task.completionCount || 0 }}</span>
              <span class="task-info__stat-label">已完成</span>
            </div>
          </div>

          <p class="task-info__desc">{{ task.description }}</p>

          <!-- Sub-task overview -->
          <div v-if="task.subTasks?.length" class="task-info__locations">
            <div
              v-for="(sub, i) in task.subTasks"
              :key="sub.id"
              class="task-info__location-item"
            >
              <span class="task-info__location-icon">&#x25CB;</span>
              <span>{{ sub.locationName || `步骤 ${i + 1}` }}</span>
            </div>
          </div>

          <!-- Progress info if in progress -->
          <div
            v-if="progressStatus === 'in_progress'"
            style="padding: 12px; background: rgba(74,124,89,0.1); border-radius: 8px; text-align: center; color: #6abf7b; font-size: 0.85rem;"
          >
            &#x25B6; 进行中 · 第 {{ progressIndex }} / {{ task.totalSubTasks }} 步
          </div>

          <!-- CTA -->
          <button
            v-if="progressStatus === 'in_progress'"
            class="cta-btn cta-btn--continue"
            @click="goPlay"
          >
            继续探索
          </button>
          <button
            v-else-if="progressStatus === 'completed'"
            class="cta-btn cta-btn--primary"
            @click="router.push(`/explore/${slug}/poster`)"
          >
            查看成就
          </button>
          <button
            v-else
            class="cta-btn cta-btn--primary"
            :disabled="startLoading"
            @click="handleStart"
          >
            {{ startLoading ? '加载中...' : '开始探索' }}
          </button>
        </div>
      </div>
    </template>

    <!-- Not found -->
    <div v-else class="empty-state" style="min-height: 100vh;">
      <div class="empty-state__icon">&#x2753;</div>
      <p class="empty-state__text">任务不存在</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExploreStore } from '../stores/explore.js'
import { isLoggedIn } from '../services/explore-api.js'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const store = useExploreStore()
const startLoading = ref(false)

const task = computed(() => store.currentTask)
const progressStatus = computed(() => store.progress?.status || null)
const progressIndex = computed(() => store.progress?.currentSubTaskIndex || 0)

const DIFFICULTY_MAP = { easy: '轻松', medium: '适中', hard: '挑战' }
const difficultyLabel = computed(() =>
  DIFFICULTY_MAP[task.value?.difficulty] || task.value?.difficulty || ''
)

onMounted(async () => {
  store.resetTaskState()
  await store.loadTaskDetail(props.slug)

  // Try to load progress if logged in
  if (isLoggedIn()) {
    try {
      await store.loadProgress(props.slug)
    } catch {
      // Not started — that's fine
    }
  }
})

async function handleStart() {
  if (!isLoggedIn()) {
    router.push({ path: '/explore', query: { login: '1' } })
    return
  }

  startLoading.value = true
  try {
    await store.doStartTask(props.slug)
    goPlay()
  } catch (err) {
    if (err.status === 409) {
      // Already started, go to play
      goPlay()
    }
  } finally {
    startLoading.value = false
  }
}

function goPlay() {
  router.push(`/explore/${props.slug}/play`)
}
</script>
```

- [ ] **Step 2: Verify TaskDetail page**

Navigate to `http://localhost:3000/#/explore/nonexistent` — should show "任务不存在". No console errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/pages/TaskDetail.vue
git commit -m "feat(explore): TaskDetail page with hero, stats, and start/continue CTA"
```

---

### Task 15: TaskPlay Page

**Files:**
- Create: `app/src/pages/TaskPlay.vue`

- [ ] **Step 1: Create TaskPlay page**

Create `app/src/pages/TaskPlay.vue`:

```vue
<template>
  <div class="play-page">
    <!-- Header -->
    <div class="play-header">
      <button class="play-header__back" @click="goBack">&#x2190;</button>
      <span class="play-header__title">
        {{ store.currentTask?.title || '探索中' }}
      </span>
      <span style="width: 32px;"></span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-spinner" style="flex: 1;">
      <div class="loading-spinner__ring"></div>
    </div>

    <!-- Completed — redirect to poster -->
    <div
      v-else-if="store.isTaskCompleted"
      class="play-content"
      style="align-items: center; justify-content: center;"
    >
      <div class="submit-feedback submit-feedback--success" style="width: 100%;">
        <p class="submit-feedback__title">&#x1F389; 探索完成!</p>
        <p class="submit-feedback__text">所有任务步骤已完成</p>
      </div>
      <button
        class="cta-btn cta-btn--primary"
        style="margin-top: 16px;"
        @click="router.push(`/explore/${slug}/poster`)"
      >
        查看成就海报
      </button>
    </div>

    <!-- Active sub-task -->
    <template v-else-if="subTask">
      <div class="play-content">
        <!-- Sub-task title -->
        <h2 style="font-size: 1.1rem; font-weight: 600; color: #e8e0d4;">
          {{ subTask.title }}
        </h2>

        <!-- Location info -->
        <div v-if="subTask.locationName" class="play-location">
          &#x1F4CD; {{ subTask.locationName }}
          <span v-if="subTask.locationAddress" style="opacity: 0.7; font-size: 0.8rem;">
            &middot; {{ subTask.locationAddress }}
          </span>
        </div>

        <!-- Instruction -->
        <div class="play-instruction">{{ subTask.instruction }}</div>

        <!-- Type-specific input -->
        <PhotoSubmit
          v-if="subTask.type === 'photo'"
          :slug="slug"
          @submitted="onSubTaskDone"
        />

        <ArrivalCheck
          v-if="subTask.type === 'arrival'"
          :slug="slug"
          :location-name="subTask.locationName || '目标位置'"
          :location-address="subTask.locationAddress || ''"
          :target-lat="subTask.locationLat ? Number(subTask.locationLat) : null"
          :target-lng="subTask.locationLng ? Number(subTask.locationLng) : null"
          @submitted="onSubTaskDone"
        />

        <PuzzleInput
          v-if="subTask.type === 'puzzle'"
          :slug="slug"
          @submitted="onSubTaskDone"
        />

        <QuizInput
          v-if="subTask.type === 'quiz'"
          :slug="slug"
          :options="quizOptions"
          @submitted="onSubTaskDone"
        />
      </div>

      <!-- Progress chain at bottom -->
      <div class="play-footer">
        <SubTaskProgress
          :total="store.totalSubTasks"
          :current-index="store.currentIndex"
        />
      </div>
    </template>

    <!-- Error / no sub-task -->
    <div v-else class="empty-state" style="flex: 1;">
      <div class="empty-state__icon">&#x26A0;</div>
      <p class="empty-state__text">无法加载任务步骤</p>
      <button
        class="cta-btn cta-btn--primary"
        style="margin-top: 16px; width: auto; padding: 12px 32px;"
        @click="reload"
      >
        重试
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExploreStore } from '../stores/explore.js'
import PhotoSubmit from '../components/PhotoSubmit.vue'
import ArrivalCheck from '../components/ArrivalCheck.vue'
import PuzzleInput from '../components/PuzzleInput.vue'
import QuizInput from '../components/QuizInput.vue'
import SubTaskProgress from '../components/SubTaskProgress.vue'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const store = useExploreStore()
const loading = ref(true)

const subTask = computed(() => store.currentSubTask)

const quizOptions = computed(() => {
  if (subTask.value?.type !== 'quiz') return []
  return subTask.value.validationConfig?.options || []
})

onMounted(async () => {
  await reload()
})

async function reload() {
  loading.value = true
  try {
    // Load task detail if not loaded
    if (!store.currentTask || store.currentTask.slug !== props.slug) {
      await store.loadTaskDetail(props.slug)
    }
    // Load current progress
    await store.loadProgress(props.slug)
  } catch (err) {
    console.error('Failed to load task play state:', err)
  } finally {
    loading.value = false
  }
}

function onSubTaskDone(result) {
  if (result?.taskCompleted) {
    // Task completed — navigate to poster
    router.push(`/explore/${props.slug}/poster`)
  }
  // Otherwise, the store already advanced to the next sub-task
}

function goBack() {
  router.push(`/explore/${props.slug}`)
}
</script>
```

- [ ] **Step 2: Verify TaskPlay page**

Navigate to `http://localhost:3000/#/explore/test/play`. Since there is no auth token, it should redirect to `/explore?login=1` (auth guard). No console errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/pages/TaskPlay.vue
git commit -m "feat(explore): TaskPlay page with type-specific subtask inputs"
```

---

### Task 16: PosterView Page

**Files:**
- Create: `app/src/pages/PosterView.vue`

- [ ] **Step 1: Create PosterView page**

Create `app/src/pages/PosterView.vue`:

```vue
<template>
  <div class="poster-view">
    <header class="page-header">
      <button class="back-btn" @click="router.push(`/explore/${slug}`)">&#x2190;</button>
      <h1 class="page-title">探索成就</h1>
    </header>

    <!-- Loading -->
    <div v-if="store.posterLoading" class="loading-spinner">
      <div class="loading-spinner__ring"></div>
    </div>

    <template v-else-if="posterData">
      <PosterCanvas ref="posterRef" :poster="posterData" />

      <div class="poster-actions">
        <button
          class="cta-btn cta-btn--primary"
          :disabled="saving"
          @click="saveImage"
        >
          {{ saving ? '生成中...' : '保存到相册' }}
        </button>
        <button
          class="cta-btn"
          style="background: #2c2c2c; color: #8a7e6e;"
          @click="router.push('/explore')"
        >
          返回任务列表
        </button>
      </div>
    </template>

    <div v-else class="empty-state">
      <div class="empty-state__icon">&#x1F3A8;</div>
      <p class="empty-state__text">海报数据加载失败</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExploreStore } from '../stores/explore.js'
import PosterCanvas from '../components/PosterCanvas.vue'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const store = useExploreStore()
const posterRef = ref(null)
const saving = ref(false)

const posterData = computed(() => store.poster)

onMounted(async () => {
  await store.loadPoster(props.slug)
})

async function saveImage() {
  if (!posterRef.value) return
  saving.value = true

  try {
    const dataUrl = await posterRef.value.toDataUrl()

    // Create download link
    const link = document.createElement('a')
    link.download = `ducheng-explore-${props.slug}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    console.error('Failed to save poster:', err)
    alert('保存失败，请长按海报图片手动保存')
  } finally {
    saving.value = false
  }
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add app/src/pages/PosterView.vue
git commit -m "feat(explore): PosterView page with canvas download"
```

---

### Task 17: BadgeCollection Page

**Files:**
- Create: `app/src/pages/BadgeCollection.vue`

- [ ] **Step 1: Create BadgeCollection page**

Create `app/src/pages/BadgeCollection.vue`:

```vue
<template>
  <div class="explore-page">
    <header class="page-header">
      <button class="back-btn" @click="router.push('/explore')">&#x2190;</button>
      <h1 class="page-title">徽章收藏</h1>
    </header>

    <!-- Loading -->
    <div v-if="store.badgesLoading" class="loading-spinner">
      <div class="loading-spinner__ring"></div>
    </div>

    <!-- Badge grid -->
    <div v-else-if="store.badges.length > 0" class="badge-grid">
      <BadgeCard
        v-for="badge in store.badges"
        :key="badge.id || badge.taskSlug"
        :badge="badge"
      />
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">
      <div class="empty-state__icon">&#x1F3C5;</div>
      <p class="empty-state__text">还没有徽章，完成探索任务即可获得</p>
    </div>

    <!-- Stats -->
    <div v-if="store.badges.length > 0" class="badge-stats">
      <p style="text-align: center; font-size: 0.8rem; color: #5a5a5a; padding: 16px 0;">
        已收集 {{ unlockedCount }} / {{ store.badges.length }} 枚徽章
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExploreStore } from '../stores/explore.js'
import BadgeCard from '../components/BadgeCard.vue'

const router = useRouter()
const store = useExploreStore()

const unlockedCount = computed(() =>
  store.badges.filter((b) => b.unlocked).length
)

onMounted(() => {
  store.loadBadges()
})
</script>

<style scoped>
.badge-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add app/src/pages/BadgeCollection.vue
git commit -m "feat(explore): BadgeCollection page with badge grid"
```

---

### Task 18: PlatformHome Integration

**Files:**
- Modify: `app/src/pages/PlatformHome.vue`

- [ ] **Step 1: Add explore entry point to PlatformHome**

Add an explore section between the city grid and the badge display. The modification adds a divider and an explore card section after the `.city-grid` div.

In `app/src/pages/PlatformHome.vue`, find the closing `</div>` of `.city-grid` (after the `v-for` block) and insert the explore section after it, before `<BadgeDisplay>`:

```vue
<template>
  <div class="platform-home page-padding">
    <header class="platform-header">
      <h1 class="platform-title">读城</h1>
      <p class="platform-subtitle text-secondary">
        在一座城市里走一条路，解一个人留下的谜。
      </p>
    </header>

    <hr class="divider" />

    <div class="city-grid">
      <div
        v-for="city in CITIES"
        :key="city.id"
        class="city-card cipher-card"
        :class="{
          'city-card--available': city.available,
          'city-card--disabled': !city.available,
          [`city-accent--${city.id}`]: true
        }"
        @click="enterCity(city)"
      >
        <div class="card-body">
          <h2 class="card-city-name">{{ city.name }}</h2>
          <p class="card-script-name">{{ city.scriptName }}</p>
          <p class="card-tagline text-secondary">
            「{{ city.tagline }}」
          </p>
        </div>

        <div class="card-footer">
          <template v-if="!city.available">
            <span class="card-status card-status--coming">即将开放</span>
          </template>
          <template v-else-if="isCityCompleted(city.id)">
            <span class="card-status card-status--done stamp stamp--success">已通关</span>
          </template>
          <template v-else-if="isCityStarted(city.id)">
            <span class="card-status card-status--progress">继续游戏</span>
          </template>
          <template v-else>
            <span class="card-status card-status--new">开始探索</span>
          </template>
        </div>
      </div>
    </div>

    <hr class="divider" />

    <!-- Explore tasks entry -->
    <div class="explore-entry" @click="router.push('/explore')">
      <div class="explore-entry__icon">&#x1F9ED;</div>
      <div class="explore-entry__body">
        <h3 class="explore-entry__title">探索任务</h3>
        <p class="explore-entry__desc">实地探索、拍照打卡、收集城市徽章</p>
      </div>
      <span class="explore-entry__arrow">&#x203A;</span>
    </div>

    <!-- Badge collection -->
    <BadgeDisplay title="城市徽章" :show-ultimate="true" />

    <footer class="platform-footer">
      <p class="footer-text text-secondary">
        读城 v0.2.0
      </p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { CITIES } from '../data/cities/index.js'
import { useGameStore } from '../stores/game.js'
import BadgeDisplay from '../components/BadgeDisplay.vue'

const router = useRouter()

function getGameStore(cityId) {
  try {
    return useGameStore(cityId)
  } catch {
    return null
  }
}

function isCityStarted(cityId) {
  const game = getGameStore(cityId)
  return game?.isStarted ?? false
}

function isCityCompleted(cityId) {
  const game = getGameStore(cityId)
  return game?.isFinished ?? false
}

function enterCity(city) {
  if (!city.available) return
  router.push(`/city/${city.id}`)
}
</script>

<style scoped>
.platform-home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
}

.platform-header {
  text-align: center;
  padding: var(--spacing-xl) 0 var(--spacing-md);
}

.platform-title {
  font-family: var(--font-handwriting);
  font-size: 2.8rem;
  font-weight: 400;
  color: #e8e0d4;
  letter-spacing: 0.3em;
  margin-bottom: var(--spacing-sm);
}

.platform-subtitle {
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  line-height: 1.8;
  color: #8a7e6e;
}

.city-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  flex: 1;
}

.city-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: #2c2c2c;
  border-color: #3a3a3a;
  position: relative;
  overflow: hidden;
}

.city-card--available:active {
  transform: scale(0.98);
}

.city-card--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.card-body {
  margin-bottom: var(--spacing-md);
}

.card-city-name {
  font-size: 1.6rem;
  font-weight: 700;
  color: #e8e0d4;
  margin-bottom: var(--spacing-xs);
  letter-spacing: 0.1em;
}

.card-script-name {
  font-family: var(--font-handwriting);
  font-size: 1.1rem;
  color: #c4b59a;
  margin-bottom: var(--spacing-sm);
}

.card-tagline {
  font-size: 0.85rem;
  line-height: 1.6;
  color: #8a7e6e;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.card-status {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.card-status--coming { color: #5a5a5a; }
.card-status--done { color: #4a7c59; }
.card-status--progress { color: #c9a96e; }
.card-status--new { color: #8a7e6e; }

.city-accent--shanghai { border-left: 4px solid #c9a96e; }
.city-accent--nanjing { border-left: 4px solid #8b1a1a; }
.city-accent--hangzhou { border-left: 4px solid #7a9e7e; }
.city-accent--xian { border-left: 4px solid #d4a020; }
.city-accent--suzhou { border-left: 4px solid #4a6fa5; }

/* Explore entry card */
.explore-entry {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: #2c2c2c;
  border: 1px solid #3a3a3a;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.explore-entry:active {
  transform: scale(0.98);
}

.explore-entry__icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.explore-entry__body {
  flex: 1;
}

.explore-entry__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e8e0d4;
  margin-bottom: 2px;
}

.explore-entry__desc {
  font-size: 0.8rem;
  color: #8a7e6e;
}

.explore-entry__arrow {
  font-size: 1.5rem;
  color: #5a5a5a;
  flex-shrink: 0;
}

.platform-footer {
  text-align: center;
  padding: var(--spacing-xl) 0 var(--spacing-md);
}

.footer-text {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: #5a5a5a;
}
</style>
```

- [ ] **Step 2: Verify PlatformHome integration**

Open `http://localhost:3000/` — the home page should show the city cards, then a divider, then the "探索任务" entry card, then the badge display. Clicking the explore card should navigate to `/#/explore`. No console errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/pages/PlatformHome.vue
git commit -m "feat(explore): add explore entry point to PlatformHome"
```

---

### Task 19: Install html2canvas Dependency

**Files:**
- Modify: `app/package.json` (via npm install)

- [ ] **Step 1: Install html2canvas**

```bash
cd app && npm install html2canvas
```

This is needed by the PosterCanvas component for the "save to album" export feature.

- [ ] **Step 2: Commit**

```bash
git add app/package.json app/package-lock.json
git commit -m "feat(explore): add html2canvas for poster export"
```

---

### Task 20: App.vue Theme Fix for Explore Routes

**Files:**
- Modify: `app/src/App.vue`

The existing `App.vue` applies city themes based on `route.params.cityId`. Explore routes have no `cityId`, so they already fall back to `theme-default`. However, the `theme-default` class uses dark colors which is what we want for explore pages. No code change needed here — verify this works.

- [ ] **Step 1: Verify theme on explore pages**

Navigate to `http://localhost:3000/#/explore` — confirm the page uses the dark theme (dark background, light text). The `theme-default` CSS class should be applied on the `.app-container`.

Open DevTools, inspect `.app-container` and confirm it has class `theme-default`.

- [ ] **Step 2: No commit needed — verification only**

---

### Task 21: End-to-End Smoke Test

- [ ] **Step 1: Start both servers**

Terminal 1 (backend):
```bash
cd ducheng-api && npm run dev
```

Terminal 2 (frontend):
```bash
cd app && npm run dev
```

- [ ] **Step 2: Test navigation flow**

Open `http://localhost:3000/` in a mobile-viewport browser (Chrome DevTools, 375px width).

1. **PlatformHome** — Verify "探索任务" card is visible. Click it.
2. **TaskList** (`/#/explore`) — Should show header, filter pills, and empty state. No console errors.
3. **Back navigation** — Click back arrow, should return to home.
4. **Direct URL** — Navigate to `/#/explore/some-slug` — should show "任务不存在".
5. **Auth guard** — Navigate to `/#/explore/test/play` — should redirect to `/#/explore?login=1`.
6. **Badge page** — Navigate to `/#/badges` — should redirect (auth guard) or show empty state.

- [ ] **Step 3: Test with seed data (when available)**

Once Phase 1A backend has seed tasks in the database:

1. Refresh `/#/explore` — task cards should appear with title, cover, difficulty, etc.
2. Click a task card — `/#/explore/:slug` — task detail page with hero image and CTA.
3. Set a test JWT token in localStorage: `localStorage.setItem('ducheng_explore_token', '<token>')`
4. Click "开始探索" — should navigate to `/#/explore/:slug/play`.
5. Complete subtasks through the type-specific inputs.
6. After last subtask — should auto-navigate to poster page.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(explore): Phase 1C complete — task browsing, execution, badges, poster"
```

---

## Self-Review

### Spec Coverage

| Spec Section | Covered? | Task |
|-------------|----------|------|
| API service layer (`explore-api.js`) | Yes | Task 1 |
| Pinia store (`explore.js`) | Yes | Task 2 |
| Explore CSS styles | Yes | Task 3 |
| Router: /explore | Yes | Task 4 |
| Router: /explore/:slug | Yes | Task 4 |
| Router: /explore/:slug/play | Yes | Task 4 |
| Router: /explore/:slug/poster | Yes | Task 4 |
| Router: /badges | Yes | Task 4 |
| Auth guard | Yes | Task 4 |
| TaskCard component | Yes | Task 5 |
| SubTaskProgress component | Yes | Task 6 |
| PhotoSubmit component | Yes | Task 7 |
| ArrivalCheck component | Yes | Task 8 |
| PuzzleInput component | Yes | Task 9 |
| QuizInput component | Yes | Task 10 |
| BadgeCard component | Yes | Task 11 |
| PosterCanvas component | Yes | Task 12 |
| TaskList page | Yes | Task 13 |
| TaskDetail page | Yes | Task 14 |
| TaskPlay page | Yes | Task 15 |
| PosterView page | Yes | Task 16 |
| BadgeCollection page | Yes | Task 17 |
| PlatformHome integration | Yes | Task 18 |
| html2canvas dependency | Yes | Task 19 |
| Theme verification | Yes | Task 20 |
| E2E smoke test | Yes | Task 21 |

### Placeholder Scan

No TBD/TODO found. All code steps contain complete implementations.

### Conventions Verified

- All components use `<script setup>` (Vue 3 Composition API)
- No TypeScript — plain JavaScript throughout
- No axios — `fetch` used via `explore-api.js` service
- Chinese UI text throughout
- CSS uses existing variables (`var(--spacing-md)`, `var(--font-body)`, etc.)
- Dark theme (matches `theme-default` colors)
- Mobile-first design (max-width 480px container from App.vue)
- Hash mode routing preserved
- Existing routes and components untouched (only PlatformHome modified)
- JWT token stored in localStorage under `ducheng_explore_token` key (separate from puzzle game state)
