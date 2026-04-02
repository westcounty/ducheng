# 「读城」Platform Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the existing Shanghai single-city puzzle game into the「读城」multi-city platform, supporting city selection, per-city theming, isolated state, and extensible data architecture.

**Architecture:** Move Shanghai data into `data/cities/shanghai/`, add city-aware routing (`/#/city/:cityId/...`), create a platform store for cross-city state, implement CSS variable-based theming, and build a city selection homepage. All existing Shanghai functionality must work identically after refactor.

**Tech Stack:** Vue 3, Vite, Pinia, Vue Router (hash mode), IndexedDB, localStorage

---

## Task 1: Restructure data layer

**Goal:** Move Shanghai-specific data files into a city-scoped directory and create a city registry + composable for dynamic loading.

**Files to create:**
- `app/src/data/cities/shanghai/puzzles.js`
- `app/src/data/cities/shanghai/narrative.js`
- `app/src/data/cities/index.js`
- `app/src/data/cities/useCityData.js`

**Files to delete (after migration verified):**
- `app/src/data/puzzles.js`
- `app/src/data/narrative.js`

### Steps

- [ ] **1.1** Create directory `app/src/data/cities/shanghai/`

```bash
mkdir -p app/src/data/cities/shanghai
```

- [ ] **1.2** Move `app/src/data/puzzles.js` to `app/src/data/cities/shanghai/puzzles.js`

```bash
mv app/src/data/puzzles.js app/src/data/cities/shanghai/puzzles.js
```

The file content stays exactly the same. No edits needed. It already exports `STAGES`, `getStage`, and `TOTAL_STAGES`.

- [ ] **1.3** Move `app/src/data/narrative.js` to `app/src/data/cities/shanghai/narrative.js`

```bash
mv app/src/data/narrative.js app/src/data/cities/shanghai/narrative.js
```

The file content stays exactly the same. No edits needed. It already exports `INTRO_STORY`, `FINALE`, `HEYING_CHECKLIST`, `STAGE_LOCATIONS`, `PHOTO_DIARY_PAIRS`.

- [ ] **1.4** Create `app/src/data/cities/index.js` -- city registry with metadata

```js
// app/src/data/cities/index.js

/**
 * 读城 — City registry
 *
 * Each city entry contains metadata used by the platform homepage,
 * routing, and theme system. The `available` flag controls whether
 * the city is playable or shown as "coming soon".
 */
export const CITIES = [
  {
    id: 'shanghai',
    name: '上海',
    scriptName: '第七封密电',
    tagline: '一个间谍的最后一条路',
    themeClass: 'theme-shanghai',
    available: true,
    totalStages: 7
  },
  {
    id: 'nanjing',
    name: '南京',
    scriptName: '金陵刻痕',
    tagline: '一个读了整座城的人',
    themeClass: 'theme-nanjing',
    available: false,
    totalStages: null
  },
  {
    id: 'hangzhou',
    name: '杭州',
    scriptName: '断桥不断',
    tagline: '一条蛇写的人类观察笔记',
    themeClass: 'theme-hangzhou',
    available: false,
    totalStages: null
  },
  {
    id: 'xian',
    name: '西安',
    scriptName: '长安译',
    tagline: '一场迟到一千三百年的晚宴',
    themeClass: 'theme-xian',
    available: false,
    totalStages: null
  }
]

/**
 * Get a city by its ID
 * @param {string} cityId
 * @returns {object|undefined}
 */
export function getCity(cityId) {
  return CITIES.find((c) => c.id === cityId)
}

/**
 * All valid city IDs
 */
export const CITY_IDS = CITIES.map((c) => c.id)
```

- [ ] **1.5** Create `app/src/data/cities/useCityData.js` -- composable for dynamic import of city data

```js
// app/src/data/cities/useCityData.js

import { ref, shallowRef, watch, toValue } from 'vue'

/**
 * In-memory cache so each city's data is only loaded once.
 * @type {Record<string, object>}
 */
const cache = {}

/**
 * Composable that dynamically imports puzzle + narrative data for a city.
 *
 * @param {import('vue').Ref<string>|string} cityIdRef - reactive or plain cityId
 * @returns {{ cityData: import('vue').ShallowRef<object|null>, loading: import('vue').Ref<boolean>, error: import('vue').Ref<string|null> }}
 *
 * Usage:
 *   const { cityData, loading } = useCityData(route.params.cityId)
 *   // cityData.value.stages, cityData.value.getStage, ...
 */
export function useCityData(cityIdRef) {
  const cityData = shallowRef(null)
  const loading = ref(true)
  const error = ref(null)

  async function load(cityId) {
    if (!cityId) {
      cityData.value = null
      loading.value = false
      return
    }

    if (cache[cityId]) {
      cityData.value = cache[cityId]
      loading.value = false
      return
    }

    loading.value = true
    error.value = null

    try {
      const [puzzlesMod, narrativeMod] = await Promise.all([
        import(`./${cityId}/puzzles.js`),
        import(`./${cityId}/narrative.js`)
      ])

      const data = {
        stages: puzzlesMod.STAGES,
        totalStages: puzzlesMod.TOTAL_STAGES,
        getStage: puzzlesMod.getStage,
        introStory: narrativeMod.INTRO_STORY,
        finale: narrativeMod.FINALE,
        photoDiaryPairs: narrativeMod.PHOTO_DIARY_PAIRS,
        heyingChecklist: narrativeMod.HEYING_CHECKLIST,
        stageLocations: narrativeMod.STAGE_LOCATIONS
      }

      cache[cityId] = data
      cityData.value = data
    } catch (err) {
      console.error(`Failed to load city data for "${cityId}":`, err)
      error.value = `无法加载城市数据：${cityId}`
      cityData.value = null
    } finally {
      loading.value = false
    }
  }

  // If cityIdRef is reactive, watch it
  watch(
    () => toValue(cityIdRef),
    (newId) => load(newId),
    { immediate: true }
  )

  return { cityData, loading, error }
}
```

- [ ] **1.6** Verify the build still works (will fail until imports are updated in later tasks, but structure should be sound)

```bash
ls app/src/data/cities/shanghai/puzzles.js
ls app/src/data/cities/shanghai/narrative.js
ls app/src/data/cities/index.js
ls app/src/data/cities/useCityData.js
```

**Commit:** `refactor: restructure data layer into cities/shanghai/ with city registry and useCityData composable`

---

## Task 2: Refactor game store for multi-city

**Goal:** Convert the single-instance game store into a factory that creates per-city Pinia stores with isolated localStorage keys.

**File to modify:** `app/src/stores/game.js`

### Steps

- [ ] **2.1** Rewrite `app/src/stores/game.js` to export a factory function `useGameStore(cityId)`

Replace the entire file content. The old content:

```js
import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { ref, reactive } from 'vue'

const STORAGE_KEY = 'seventh-cipher-game-state'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useGameStore = defineStore('game', () => {
```

New content for the full file:

```js
// app/src/stores/game.js

import { defineStore } from 'pinia'
import { computed, ref, reactive } from 'vue'

/**
 * Cache of already-created store functions keyed by cityId.
 * Each value is a Pinia `defineStore` return (a composable function).
 * @type {Record<string, ReturnType<typeof defineStore>>}
 */
const storeRegistry = {}

/**
 * Create or retrieve a per-city game store.
 *
 * Each cityId gets its own Pinia store instance with isolated state
 * and its own localStorage key: `ducheng_{cityId}_state`.
 *
 * @param {string} cityId - e.g. 'shanghai', 'nanjing'
 * @returns {ReturnType<ReturnType<typeof defineStore>>} Pinia store instance
 */
export function useGameStore(cityId) {
  if (!cityId) {
    throw new Error('useGameStore requires a cityId argument')
  }

  if (!storeRegistry[cityId]) {
    const storeName = `game-${cityId}`
    const STORAGE_KEY = `ducheng_${cityId}_state`

    storeRegistry[cityId] = defineStore(storeName, () => {
      // ── Persistence helpers ────────────────────────────────

      function loadFromStorage() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          return raw ? JSON.parse(raw) : null
        } catch {
          return null
        }
      }

      // ── State ──────────────────────────────────────────────

      const saved = loadFromStorage()

      /** Current stage index (0 = not started, 1-7 = playing, 8 = finale) */
      const currentStage = ref(saved?.currentStage ?? 0)

      /** Current step within the active stage (0-indexed) */
      const currentStep = ref(saved?.currentStep ?? 0)

      /** Collected cipher fragments: { [stageId]: fragmentString } */
      const cipherFragments = reactive(saved?.cipherFragments ?? {})

      /** Stage IDs for which a photo has been taken */
      const photosTaken = reactive(saved?.photosTaken ?? [])

      /** Hints used per stage: { [stageId]: count } */
      const hintsUsed = reactive(saved?.hintsUsed ?? {})

      /** ISO timestamp when the game started */
      const startTime = ref(saved?.startTime ?? null)

      /** ISO timestamp when each stage was entered: { [stageId]: iso } */
      const stageStartTimes = reactive(saved?.stageStartTimes ?? {})

      /** ISO timestamp when each stage was cleared: { [stageId]: iso } */
      const stageClearTimes = reactive(saved?.stageClearTimes ?? {})

      // ── Computed ───────────────────────────────────────────

      const isStarted = computed(() => startTime.value !== null)

      const isFinished = computed(() => currentStage.value === 8 && stageClearTimes[8] !== undefined)

      const collectedCount = computed(() => Object.keys(cipherFragments).length)

      // ── Persistence ────────────────────────────────────────

      function persist() {
        const state = {
          currentStage: currentStage.value,
          currentStep: currentStep.value,
          cipherFragments: { ...cipherFragments },
          photosTaken: [...photosTaken],
          hintsUsed: { ...hintsUsed },
          startTime: startTime.value,
          stageStartTimes: { ...stageStartTimes },
          stageClearTimes: { ...stageClearTimes }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      }

      // ── Actions ────────────────────────────────────────────

      function startGame() {
        currentStage.value = 1
        currentStep.value = 0
        startTime.value = new Date().toISOString()
        stageStartTimes[1] = new Date().toISOString()
        persist()
      }

      function advanceStep() {
        currentStep.value++
        persist()
      }

      /**
       * Mark a stage as complete and store its cipher fragment
       * @param {number} stageId
       * @param {string} fragment
       */
      function completeStage(stageId, fragment) {
        cipherFragments[stageId] = fragment
        stageClearTimes[stageId] = new Date().toISOString()
        persist()
      }

      function goToNextStage() {
        const next = currentStage.value + 1
        if (next <= 7) {
          currentStage.value = next
          currentStep.value = 0
          stageStartTimes[next] = new Date().toISOString()
        }
        persist()
      }

      function enterFinale() {
        currentStage.value = 8
        currentStep.value = 0
        stageStartTimes[8] = new Date().toISOString()
        persist()
      }

      function completeGame() {
        stageClearTimes[8] = new Date().toISOString()
        persist()
      }

      /**
       * Record that a photo was taken for a stage
       * @param {number} stageId
       */
      function recordPhoto(stageId) {
        if (!photosTaken.includes(stageId)) {
          photosTaken.push(stageId)
        }
        persist()
      }

      /**
       * Record a hint use for a stage
       * @param {number} stageId
       */
      function useHint(stageId) {
        hintsUsed[stageId] = (hintsUsed[stageId] ?? 0) + 1
        persist()
      }

      function resetGame() {
        currentStage.value = 0
        currentStep.value = 0
        Object.keys(cipherFragments).forEach((k) => delete cipherFragments[k])
        photosTaken.splice(0)
        Object.keys(hintsUsed).forEach((k) => delete hintsUsed[k])
        startTime.value = null
        Object.keys(stageStartTimes).forEach((k) => delete stageStartTimes[k])
        Object.keys(stageClearTimes).forEach((k) => delete stageClearTimes[k])
        localStorage.removeItem(STORAGE_KEY)
      }

      return {
        // State
        currentStage,
        currentStep,
        cipherFragments,
        photosTaken,
        hintsUsed,
        startTime,
        stageStartTimes,
        stageClearTimes,
        // Computed
        isStarted,
        isFinished,
        collectedCount,
        // Actions
        startGame,
        advanceStep,
        completeStage,
        goToNextStage,
        enterFinale,
        completeGame,
        recordPhoto,
        useHint,
        resetGame
      }
    })
  }

  // Call the stored defineStore composable to get the actual store instance
  return storeRegistry[cityId]()
}
```

Key changes from original:
- `export const useGameStore = defineStore('game', ...)` becomes `export function useGameStore(cityId) { ... }`
- `STORAGE_KEY` changes from `'seventh-cipher-game-state'` to `` `ducheng_${cityId}_state` ``
- Store name changes from `'game'` to `` `game-${cityId}` ``
- Store definition is cached in `storeRegistry` to avoid re-defining

**Commit:** `refactor: convert game store to per-city factory with isolated localStorage keys`

---

## Task 3: Refactor photo store for multi-city

**Goal:** Modify `photo-store.js` so that IndexedDB storage is namespaced by cityId. Database name changes to `ducheng-photos`, with one object store per city.

**File to modify:** `app/src/utils/photo-store.js`

### Steps

- [ ] **3.1** Rewrite `app/src/utils/photo-store.js` to accept `cityId` in all functions

Replace the entire file. Old content starts with:

```js
const DB_NAME = 'seventh-cipher-photos'
const DB_VERSION = 1
const STORE_NAME = 'photos'
```

New content:

```js
// app/src/utils/photo-store.js

/**
 * IndexedDB wrapper for photo storage — multi-city version.
 *
 * Database: 'ducheng-photos'
 * Object stores: one per city (e.g. 'shanghai', 'nanjing')
 * Keys within each store: `stage-${stageId}`
 * Values: Blob
 */

const DB_NAME = 'ducheng-photos'

/**
 * Current DB version. Bump this and update onupgradeneeded
 * when adding new city object stores.
 */
const DB_VERSION = 2

/**
 * All city IDs that need object stores.
 * Must match the city IDs in data/cities/index.js.
 */
const CITY_STORES = ['shanghai', 'nanjing', 'hangzhou', 'xian']

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      for (const cityId of CITY_STORES) {
        if (!db.objectStoreNames.contains(cityId)) {
          db.createObjectStore(cityId)
        }
      }
    }

    request.onsuccess = (event) => resolve(event.target.result)
    request.onerror = (event) => reject(event.target.error)
  })
}

/**
 * Save a photo blob for a given city + stage
 * @param {string} cityId - e.g. 'shanghai'
 * @param {number|string} stageId
 * @param {Blob} blob
 */
export async function savePhoto(cityId, stageId, blob) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(cityId, 'readwrite')
    const store = tx.objectStore(cityId)
    const key = `stage-${stageId}`
    const request = store.put(blob, key)
    request.onsuccess = () => resolve()
    request.onerror = (event) => reject(event.target.error)
    tx.oncomplete = () => db.close()
  })
}

/**
 * Retrieve a photo blob for a given city + stage
 * @param {string} cityId - e.g. 'shanghai'
 * @param {number|string} stageId
 * @returns {Promise<Blob|null>}
 */
export async function getPhoto(cityId, stageId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(cityId, 'readonly')
    const store = tx.objectStore(cityId)
    const key = `stage-${stageId}`
    const request = store.get(key)
    request.onsuccess = (event) => resolve(event.target.result || null)
    request.onerror = (event) => reject(event.target.error)
    tx.oncomplete = () => db.close()
  })
}

/**
 * Retrieve all stored photos for a city
 * @param {string} cityId - e.g. 'shanghai'
 * @returns {Promise<{[key: string]: Blob}>}
 */
export async function getAllPhotos(cityId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(cityId, 'readonly')
    const store = tx.objectStore(cityId)
    const result = {}
    const cursorRequest = store.openCursor()

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        result[cursor.key] = cursor.value
        cursor.continue()
      } else {
        resolve(result)
      }
    }

    cursorRequest.onerror = (event) => reject(event.target.error)
    tx.oncomplete = () => db.close()
  })
}
```

Key changes from original:
- `DB_NAME`: `'seventh-cipher-photos'` becomes `'ducheng-photos'`
- `DB_VERSION`: `1` becomes `2`
- Instead of one `'photos'` object store, creates one store per city in `CITY_STORES`
- `savePhoto(stageId, blob)` becomes `savePhoto(cityId, stageId, blob)`
- `getPhoto(stageId)` becomes `getPhoto(cityId, stageId)`
- `getAllPhotos()` becomes `getAllPhotos(cityId)`

**Commit:** `refactor: namespace photo IndexedDB storage by cityId`

---

## Task 4: Refactor router for multi-city

**Goal:** Add `/city/:cityId` prefix to all game routes, add a platform homepage at `/`, add backward-compatible redirects for old Shanghai URLs.

**File to modify:** `app/src/router.js`

### Steps

- [ ] **4.1** Rewrite `app/src/router.js`

Replace the entire file. Old content:

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import { useGameStore } from './stores/game.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./pages/Home.vue')
  },
  ...
```

New content:

```js
// app/src/router.js

import { createRouter, createWebHashHistory } from 'vue-router'
import { useGameStore } from './stores/game.js'
import { CITY_IDS } from './data/cities/index.js'

const routes = [
  // ── Platform homepage (city selection) ──────────────────
  {
    path: '/',
    name: 'PlatformHome',
    component: () => import('./pages/PlatformHome.vue')
  },

  // ── City-scoped routes ─────────────────────────────────
  {
    path: '/city/:cityId',
    name: 'CityHome',
    component: () => import('./pages/Home.vue'),
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

  // ── Backward compatibility redirects (old Shanghai URLs) ──
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
  // Platform home — always allowed
  if (to.path === '/') return true

  const cityId = to.params.cityId
  if (!cityId) return true

  // Validate cityId
  if (!CITY_IDS.includes(cityId)) {
    return '/'
  }

  const game = useGameStore(cityId)

  if (to.name === 'CityHome') return true

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

Key changes from original:
- Old `'/'` route (Home) becomes `'/city/:cityId'` named `'CityHome'`
- New `'/'` route points to `PlatformHome.vue` (created in Task 5)
- All game routes get `/city/:cityId` prefix
- Route guard reads `cityId` from params and passes it to `useGameStore(cityId)`
- Guard redirects to `/city/${cityId}` instead of `/` for unauthorized access
- Four backward-compat redirects map old `/stage/:id` etc. to `/city/shanghai/...`

**Commit:** `refactor: add city-scoped routing with backward-compatible redirects`

---

## Task 5: Create city selection homepage

**Goal:** Create a new `PlatformHome.vue` page that displays 4 city cards with name, subtitle, completion status, and links to each city's game.

**File to create:** `app/src/pages/PlatformHome.vue`

### Steps

- [ ] **5.1** Create `app/src/pages/PlatformHome.vue`

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

.card-status--coming {
  color: #5a5a5a;
}

.card-status--done {
  color: #4a7c59;
}

.card-status--progress {
  color: #c9a96e;
}

.card-status--new {
  color: #8a7e6e;
}

/* Per-city accent colors on the left border */
.city-accent--shanghai {
  border-left: 4px solid #c9a96e;
}

.city-accent--nanjing {
  border-left: 4px solid #8b1a1a;
}

.city-accent--hangzhou {
  border-left: 4px solid #7a9e7e;
}

.city-accent--xian {
  border-left: 4px solid #d4a020;
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

**Commit:** `feat: add PlatformHome city selection page`

---

## Task 6: Implement CSS theme system

**Goal:** Define CSS variables for 4 city themes, update App.vue to dynamically apply the correct theme class based on the current route's `cityId`.

**Files to modify:**
- `app/src/styles/theme.css`
- `app/src/App.vue`

**Files to create:**
- (none -- themes go inline in theme.css)

### Steps

- [ ] **6.1** Add theme classes to `app/src/styles/theme.css`

Append the following at the end of the file (after the existing `.animate-stamp` rule at line 366):

```css
/* ============================================
   City Theme Overrides
   ============================================ */

/**
 * Shanghai — current default (vintage archive, copper gold).
 * The :root variables above ARE the Shanghai theme already,
 * so .theme-shanghai just re-declares for explicitness.
 */
.theme-shanghai {
  --bg-primary: #f5f0e8;
  --bg-secondary: #ebe4d4;
  --text-primary: #2c1810;
  --text-secondary: #5c4a3a;
  --accent: #8b4513;
  --border: #c4b59a;
  --success: #4a7c59;
  --error: #8b2500;
  --paper-texture:
    radial-gradient(ellipse at 20% 30%, rgba(139, 69, 19, 0.03) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 70%, rgba(92, 74, 58, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 10%, rgba(196, 181, 154, 0.06) 0%, transparent 70%);
  --shadow-sm: 0 1px 3px rgba(44, 24, 16, 0.12);
  --shadow-md: 0 4px 12px rgba(44, 24, 16, 0.15);
  --shadow-lg: 0 8px 24px rgba(44, 24, 16, 0.2);
}

/**
 * Nanjing — brick red + deep red, ancient heavy feel.
 */
.theme-nanjing {
  --bg-primary: #2a2218;
  --bg-secondary: #3d3226;
  --text-primary: #e8dcc8;
  --text-secondary: #a89878;
  --accent: #8b1a1a;
  --border: #5a4a3a;
  --success: #5a8a4a;
  --error: #cc3333;
  --paper-texture:
    radial-gradient(ellipse at 30% 40%, rgba(139, 26, 26, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 60%, rgba(90, 74, 58, 0.05) 0%, transparent 50%);
  --shadow-sm: 0 1px 3px rgba(42, 34, 24, 0.2);
  --shadow-md: 0 4px 12px rgba(42, 34, 24, 0.25);
  --shadow-lg: 0 8px 24px rgba(42, 34, 24, 0.3);
}

/**
 * Hangzhou — ink wash green + white, elegant literati feel.
 */
.theme-hangzhou {
  --bg-primary: #f5f0eb;
  --bg-secondary: #e8e2d8;
  --text-primary: #2c3e2c;
  --text-secondary: #5a6a5a;
  --accent: #7a9e7e;
  --border: #c8c0b4;
  --success: #5a8a5a;
  --error: #8b3a3a;
  --paper-texture:
    radial-gradient(ellipse at 40% 30%, rgba(122, 158, 126, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 60% 70%, rgba(200, 192, 180, 0.06) 0%, transparent 50%);
  --shadow-sm: 0 1px 3px rgba(44, 62, 44, 0.1);
  --shadow-md: 0 4px 12px rgba(44, 62, 44, 0.12);
  --shadow-lg: 0 8px 24px rgba(44, 62, 44, 0.15);
}

/**
 * Xi'an — Tang gold + ochre, grand imperial feel.
 */
.theme-xian {
  --bg-primary: #1e1210;
  --bg-secondary: #2e1e18;
  --text-primary: #f0e0c8;
  --text-secondary: #b0956a;
  --accent: #d4a020;
  --border: #5a3a2a;
  --success: #6a8a4a;
  --error: #cc4444;
  --paper-texture:
    radial-gradient(ellipse at 25% 35%, rgba(212, 160, 32, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 75% 65%, rgba(90, 58, 42, 0.05) 0%, transparent 50%);
  --shadow-sm: 0 1px 3px rgba(30, 18, 16, 0.25);
  --shadow-md: 0 4px 12px rgba(30, 18, 16, 0.3);
  --shadow-lg: 0 8px 24px rgba(30, 18, 16, 0.35);
}

/**
 * Platform default theme (dark neutral, used on PlatformHome).
 */
.theme-default {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2c2c2c;
  --text-primary: #e8e0d4;
  --text-secondary: #8a7e6e;
  --accent: #c4b59a;
  --border: #3a3a3a;
  --success: #4a7c59;
  --error: #8b2500;
  --paper-texture: none;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.3);
}
```

- [ ] **6.2** Rewrite `app/src/App.vue` to watch the route and apply the correct theme class

Replace the entire file. Old content:

```vue
<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #2c2c2c;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  font-family: var(--font-body);
}

.app-container {
  width: 100%;
  max-width: 480px;
  min-height: 100vh;
  background-color: var(--bg-primary);
  background-image: var(--paper-texture);
  position: relative;
  overflow-x: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

New content:

```vue
<template>
  <div class="app-container" :class="themeClass">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getCity } from './data/cities/index.js'

const route = useRoute()

const themeClass = computed(() => {
  const cityId = route.params.cityId
  if (!cityId) return 'theme-default'
  const city = getCity(cityId)
  return city ? city.themeClass : 'theme-default'
})
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #1a1a1a;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  font-family: var(--font-body);
}

.app-container {
  width: 100%;
  max-width: 480px;
  min-height: 100vh;
  background-color: var(--bg-primary);
  background-image: var(--paper-texture);
  position: relative;
  overflow-x: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

Key changes from original:
- Added `<script setup>` block with `useRoute()` and `themeClass` computed
- `.app-container` now binds `:class="themeClass"`
- `body` background changed from `#2c2c2c` to `#1a1a1a` (neutral dark for platform)
- Imports `getCity` from the new city registry

**Commit:** `feat: implement CSS theme system with per-city variables and dynamic switching`

---

## Task 7: Create platform store

**Goal:** Create a Pinia store for platform-level state: tracking completed cities and cross-city easter egg unlocks.

**File to create:** `app/src/stores/platform.js`

### Steps

- [ ] **7.1** Create `app/src/stores/platform.js`

```js
// app/src/stores/platform.js

import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

const STORAGE_KEY = 'ducheng_platform_state'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const usePlatformStore = defineStore('platform', () => {
  const saved = loadFromStorage()

  // ── State ────────────────────────────────────────────────

  /** List of completed city IDs, e.g. ['shanghai'] */
  const completedCities = ref(saved?.completedCities ?? [])

  /** Cross-city easter egg unlock flags, e.g. { 'shanghai+nanjing': true } */
  const easterEggUnlocked = reactive(saved?.easterEggUnlocked ?? {})

  // ── Computed ─────────────────────────────────────────────

  const allCitiesCompleted = computed(() => completedCities.value.length >= 4)

  // ── Persistence ──────────────────────────────────────────

  function persist() {
    const state = {
      completedCities: [...completedCities.value],
      easterEggUnlocked: { ...easterEggUnlocked }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  // ── Actions ──────────────────────────────────────────────

  /**
   * Mark a city as completed (called from Finale when game.completeGame() runs)
   * @param {string} cityId
   */
  function markCityCompleted(cityId) {
    if (!completedCities.value.includes(cityId)) {
      completedCities.value.push(cityId)
      checkCrossCityUnlocks()
      persist()
    }
  }

  /**
   * Check if two-city pairs unlock cross-city easter eggs
   */
  function checkCrossCityUnlocks() {
    const pairs = [
      ['shanghai', 'nanjing'],
      ['shanghai', 'hangzhou'],
      ['nanjing', 'xian'],
      ['hangzhou', 'xian']
    ]
    for (const [a, b] of pairs) {
      const key = `${a}+${b}`
      if (
        completedCities.value.includes(a) &&
        completedCities.value.includes(b) &&
        !easterEggUnlocked[key]
      ) {
        easterEggUnlocked[key] = true
      }
    }
  }

  /**
   * Check if a specific city is completed
   * @param {string} cityId
   * @returns {boolean}
   */
  function isCityCompleted(cityId) {
    return completedCities.value.includes(cityId)
  }

  /**
   * Reset all platform state
   */
  function resetPlatform() {
    completedCities.value = []
    Object.keys(easterEggUnlocked).forEach((k) => delete easterEggUnlocked[k])
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    // State
    completedCities,
    easterEggUnlocked,
    // Computed
    allCitiesCompleted,
    // Actions
    markCityCompleted,
    isCityCompleted,
    resetPlatform
  }
})
```

**Commit:** `feat: add platform store for cross-city state tracking`

---

## Task 8: Update page components for city-awareness

**Goal:** Modify Home.vue, Stage.vue, Transit.vue, Finale.vue, and Archive.vue to read `cityId` from route params, use `useCityData(cityId)` for data, and pass `cityId` to game store and photo store.

**Files to modify:**
- `app/src/pages/Home.vue`
- `app/src/pages/Stage.vue`
- `app/src/pages/Transit.vue`
- `app/src/pages/Finale.vue`
- `app/src/pages/Archive.vue`
- `app/src/components/PhotoCapture.vue`
- `app/src/components/HintSystem.vue`

### Steps

- [ ] **8.1** Update `app/src/pages/Home.vue` (city game homepage)

In the `<script setup>` block, make these changes:

Old:
```js
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { INTRO_STORY } from '../data/narrative.js'
import NarrativeText from '../components/NarrativeText.vue'

const game = useGameStore()
const router = useRouter()

const introComplete = ref(false)

function acceptMission() {
  game.startGame()
  router.push('/stage/1')
}

function continueGame() {
  if (game.currentStage >= 8) {
    router.push('/finale')
  } else {
    router.push(`/stage/${game.currentStage}`)
  }
}

function goToArchive() {
  router.push('/archive')
}

function confirmReset() {
  if (confirm('确定要重新开始吗？所有进度将被清除。')) {
    game.resetGame()
    introComplete.value = false
  }
}
```

New:
```js
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { useCityData } from '../data/cities/useCityData.js'
import NarrativeText from '../components/NarrativeText.vue'

const props = defineProps({
  cityId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const route = useRoute()
const game = useGameStore(props.cityId)
const { cityData, loading } = useCityData(computed(() => props.cityId))

const INTRO_STORY = computed(() => cityData.value?.introStory ?? '')

const introComplete = ref(false)

function acceptMission() {
  game.startGame()
  router.push(`/city/${props.cityId}/stage/1`)
}

function continueGame() {
  if (game.currentStage >= 8) {
    router.push(`/city/${props.cityId}/finale`)
  } else {
    router.push(`/city/${props.cityId}/stage/${game.currentStage}`)
  }
}

function goToArchive() {
  router.push(`/city/${props.cityId}/archive`)
}

function confirmReset() {
  if (confirm('确定要重新开始吗？所有进度将被清除。')) {
    game.resetGame()
    introComplete.value = false
  }
}
```

In the `<template>`, change the NarrativeText binding from `:text="INTRO_STORY"` to `:text="INTRO_STORY"` (no template change needed since `INTRO_STORY` is now a computed).

Also wrap the main content in a `v-if="!loading"` guard. Change:

```html
    <!-- Not started: show intro story then action button -->
    <template v-if="!game.isStarted">
```

To:

```html
    <template v-if="loading">
      <p class="text-secondary">载入中...</p>
    </template>

    <!-- Not started: show intro story then action button -->
    <template v-else-if="!game.isStarted">
```

And change:

```html
    <!-- Already started: show progress and resume -->
    <template v-else>
```

To:

```html
    <!-- Already started: show progress and resume -->
    <template v-else-if="game.isStarted">
```

- [ ] **8.2** Update `app/src/pages/Stage.vue`

In the `<script setup>` block, make these changes:

Old:
```js
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { getStage } from '../data/puzzles.js'
import NarrativeText from '../components/NarrativeText.vue'
import AnswerInput from '../components/AnswerInput.vue'
import HintSystem from '../components/HintSystem.vue'
import PhotoCapture from '../components/PhotoCapture.vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()
const game = useGameStore()

const stageId = computed(() => Number(props.id))
const stage = computed(() => getStage(stageId.value))
```

New:
```js
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { useCityData } from '../data/cities/useCityData.js'
import NarrativeText from '../components/NarrativeText.vue'
import AnswerInput from '../components/AnswerInput.vue'
import HintSystem from '../components/HintSystem.vue'
import PhotoCapture from '../components/PhotoCapture.vue'

const props = defineProps({
  cityId: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()
const game = useGameStore(props.cityId)
const { cityData, loading } = useCityData(computed(() => props.cityId))

const stageId = computed(() => Number(props.id))
const stage = computed(() => {
  if (!cityData.value) return null
  return cityData.value.getStage(stageId.value)
})
```

Update the `goToTransit` function:

Old:
```js
function goToTransit() {
  const nextId = stageId.value + 1
  router.push(`/transit/${stageId.value}/${nextId}`)
}
```

New:
```js
function goToTransit() {
  const nextId = stageId.value + 1
  router.push(`/city/${props.cityId}/transit/${stageId.value}/${nextId}`)
}
```

Update the `goToFinale` function:

Old:
```js
function goToFinale() {
  game.enterFinale()
  router.push('/finale')
}
```

New:
```js
function goToFinale() {
  game.enterFinale()
  router.push(`/city/${props.cityId}/finale`)
}
```

In the `<template>`, update the PhotoCapture component to pass `cityId`:

Old:
```html
        <PhotoCapture
          :stage-id="stage.id"
          :prompt="stage.photoPrompt"
          @done="onPhotoDone"
        />
```

New:
```html
        <PhotoCapture
          :city-id="props.cityId"
          :stage-id="stage.id"
          :prompt="stage.photoPrompt"
          @done="onPhotoDone"
        />
```

- [ ] **8.3** Update `app/src/pages/Transit.vue`

In the `<script setup>` block, make these changes:

Old:
```js
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { getStage } from '../data/puzzles.js'

const props = defineProps({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  }
})

const router = useRouter()
const game = useGameStore()

const fromStage = computed(() => getStage(Number(props.from)))
const toStage = computed(() => getStage(Number(props.to)))

function arrived() {
  game.goToNextStage()
  router.push(`/stage/${props.to}`)
}
```

New:
```js
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { useCityData } from '../data/cities/useCityData.js'

const props = defineProps({
  cityId: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  }
})

const router = useRouter()
const game = useGameStore(props.cityId)
const { cityData } = useCityData(computed(() => props.cityId))

const fromStage = computed(() => {
  if (!cityData.value) return null
  return cityData.value.getStage(Number(props.from))
})

const toStage = computed(() => {
  if (!cityData.value) return null
  return cityData.value.getStage(Number(props.to))
})

function arrived() {
  game.goToNextStage()
  router.push(`/city/${props.cityId}/stage/${props.to}`)
}
```

- [ ] **8.4** Update `app/src/pages/Finale.vue`

In the `<script setup>` block, make these changes:

Old:
```js
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { PHOTO_DIARY_PAIRS, FINALE, HEYING_CHECKLIST } from '../data/narrative.js'
import { getPhoto } from '../utils/photo-store.js'
import NarrativeText from '../components/NarrativeText.vue'

const router = useRouter()
const game = useGameStore()
```

New:
```js
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { usePlatformStore } from '../stores/platform.js'
import { useCityData } from '../data/cities/useCityData.js'
import { getPhoto } from '../utils/photo-store.js'
import NarrativeText from '../components/NarrativeText.vue'

const props = defineProps({
  cityId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const game = useGameStore(props.cityId)
const platform = usePlatformStore()
const { cityData, loading } = useCityData(computed(() => props.cityId))

const PHOTO_DIARY_PAIRS = computed(() => cityData.value?.photoDiaryPairs ?? [])
const HEYING_CHECKLIST_DATA = computed(() => cityData.value?.heyingChecklist ?? [])
```

Update the static data references. Replace:

```js
const CHECKLIST = HEYING_CHECKLIST
```

With:

```js
const CHECKLIST = computed(() => HEYING_CHECKLIST_DATA.value)
```

Update the `loadPhotos` function:

Old:
```js
async function loadPhotos() {
  for (const pair of PHOTO_DIARY_PAIRS) {
    try {
      const blob = await getPhoto(pair.stage)
      if (blob) {
        photos.value[pair.stage] = URL.createObjectURL(blob)
      }
    } catch (err) {
      console.warn(`No photo for stage ${pair.stage}`)
    }
  }
}
```

New:
```js
async function loadPhotos() {
  for (const pair of PHOTO_DIARY_PAIRS.value) {
    try {
      const blob = await getPhoto(props.cityId, pair.stage)
      if (blob) {
        photos.value[pair.stage] = URL.createObjectURL(blob)
      }
    } catch (err) {
      console.warn(`No photo for stage ${pair.stage}`)
    }
  }
}
```

Update `completeGame` call in `revealChecklistItems` to also mark city as completed on platform store:

Old:
```js
        showFinalMsg.value = true
        game.completeGame()
```

New:
```js
        showFinalMsg.value = true
        game.completeGame()
        platform.markCityCompleted(props.cityId)
```

Update the `goToArchive` function:

Old:
```js
function goToArchive() {
  router.push('/archive')
}
```

New:
```js
function goToArchive() {
  router.push(`/city/${props.cityId}/archive`)
}
```

In the `<template>`, the `v-for` loops that reference `PHOTO_DIARY_PAIRS` and `CHECKLIST` will work automatically since they are now computed refs (Vue auto-unwraps).

Wrap the entire template in a loading guard. At the top of the template, after `<div class="finale page-padding">`, add:

```html
    <template v-if="loading">
      <p class="text-secondary">载入中...</p>
    </template>
    <transition v-else name="phase-fade" mode="out-in">
```

(Replace the existing `<transition name="phase-fade" mode="out-in">` opening tag.)

- [ ] **8.5** Update `app/src/pages/Archive.vue`

In the `<script setup>` block, make these changes:

Old:
```js
import { ref, reactive, computed, onMounted } from 'vue'
import { PHOTO_DIARY_PAIRS, HEYING_CHECKLIST, STAGE_LOCATIONS } from '../data/narrative.js'
import { getPhoto } from '../utils/photo-store.js'
import { useGameStore } from '../stores/game.js'

const photos = ref({})
const openExcerpts = reactive({})
const game = useGameStore()
```

New:
```js
import { ref, reactive, computed, onMounted } from 'vue'
import { useCityData } from '../data/cities/useCityData.js'
import { getPhoto } from '../utils/photo-store.js'
import { useGameStore } from '../stores/game.js'

const props = defineProps({
  cityId: {
    type: String,
    required: true
  }
})

const { cityData, loading } = useCityData(computed(() => props.cityId))

const PHOTO_DIARY_PAIRS = computed(() => cityData.value?.photoDiaryPairs ?? [])
const HEYING_CHECKLIST = computed(() => cityData.value?.heyingChecklist ?? [])
const STAGE_LOCATIONS = computed(() => cityData.value?.stageLocations ?? [])

const photos = ref({})
const openExcerpts = reactive({})
const game = useGameStore(props.cityId)
```

Update `onMounted` photo loading:

Old:
```js
onMounted(async () => {
  for (const pair of PHOTO_DIARY_PAIRS) {
    try {
      const blob = await getPhoto(pair.stage)
      if (blob) {
        photos.value[pair.stage] = URL.createObjectURL(blob)
      }
    } catch (err) {
      console.warn(`No photo for stage ${pair.stage}`)
    }
  }
})
```

New:
```js
onMounted(async () => {
  // Wait for city data to load if not yet ready
  if (!cityData.value) {
    const unwatch = await new Promise((resolve) => {
      const stop = import('vue').then(({ watch }) => {
        // Already done in useCityData, just wait
      })
    })
  }
  for (const pair of PHOTO_DIARY_PAIRS.value) {
    try {
      const blob = await getPhoto(props.cityId, pair.stage)
      if (blob) {
        photos.value[pair.stage] = URL.createObjectURL(blob)
      }
    } catch (err) {
      console.warn(`No photo for stage ${pair.stage}`)
    }
  }
})
```

Actually, simpler approach -- use `watch` to load photos when cityData becomes available:

```js
import { ref, reactive, computed, watch } from 'vue'

// ... (rest of setup)

async function loadAllPhotos() {
  for (const pair of PHOTO_DIARY_PAIRS.value) {
    try {
      const blob = await getPhoto(props.cityId, pair.stage)
      if (blob) {
        photos.value[pair.stage] = URL.createObjectURL(blob)
      }
    } catch (err) {
      console.warn(`No photo for stage ${pair.stage}`)
    }
  }
}

watch(
  () => cityData.value,
  (data) => {
    if (data) loadAllPhotos()
  },
  { immediate: true }
)
```

Remove the `onMounted` hook entirely since the `watch` with `immediate: true` handles it.

In the `<template>`, wrap in loading guard at line 2:

Old:
```html
  <div class="archive page-padding">
    <header class="archive-header">
```

New:
```html
  <div class="archive page-padding">
    <template v-if="loading">
      <p class="text-secondary">载入中...</p>
    </template>
    <template v-else>
    <header class="archive-header">
```

And close the `</template>` before the final `</div>`.

- [ ] **8.6** Update `app/src/components/PhotoCapture.vue` to accept `cityId` prop

In the `<script setup>` block, add `cityId` prop and pass it to `savePhoto`:

Old:
```js
const props = defineProps({
  stageId: {
    type: Number,
    required: true
  },
  prompt: {
    type: String,
    required: true
  }
})
```

New:
```js
const props = defineProps({
  cityId: {
    type: String,
    required: true
  },
  stageId: {
    type: Number,
    required: true
  },
  prompt: {
    type: String,
    required: true
  }
})
```

Remove the game store import and usage since PhotoCapture should not create its own game store -- the parent passes cityId:

Old:
```js
import { ref } from 'vue'
import { savePhoto } from '../utils/photo-store.js'
import { useGameStore } from '../stores/game.js'

// ... inside setup:
const game = useGameStore()

// ... in handleCapture:
    await savePhoto(props.stageId, file)
    game.recordPhoto(props.stageId)
```

New:
```js
import { ref } from 'vue'
import { savePhoto } from '../utils/photo-store.js'

// ... no game store needed in this component

// ... in handleCapture:
    await savePhoto(props.cityId, props.stageId, file)
```

The `game.recordPhoto` call should be emitted as an event so the parent handles it. Update the emit:

Old:
```js
const emit = defineEmits(['done'])
```

New:
```js
const emit = defineEmits(['done', 'photo-saved'])
```

And in `handleCapture`:

Old:
```js
async function handleCapture(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // Show preview immediately
  previewUrl.value = URL.createObjectURL(file)

  // Save to IndexedDB
  try {
    await savePhoto(props.stageId, file)
    game.recordPhoto(props.stageId)
  } catch (err) {
    console.error('Failed to save photo:', err)
  }

  setTimeout(() => {
    emit('done')
  }, 1500)
}
```

New:
```js
async function handleCapture(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // Show preview immediately
  previewUrl.value = URL.createObjectURL(file)

  // Save to IndexedDB
  try {
    await savePhoto(props.cityId, props.stageId, file)
    emit('photo-saved', props.stageId)
  } catch (err) {
    console.error('Failed to save photo:', err)
  }

  setTimeout(() => {
    emit('done')
  }, 1500)
}
```

Then in `Stage.vue` template, handle the new event:

Old:
```html
        <PhotoCapture
          :city-id="props.cityId"
          :stage-id="stage.id"
          :prompt="stage.photoPrompt"
          @done="onPhotoDone"
        />
```

New:
```html
        <PhotoCapture
          :city-id="props.cityId"
          :stage-id="stage.id"
          :prompt="stage.photoPrompt"
          @photo-saved="(sid) => game.recordPhoto(sid)"
          @done="onPhotoDone"
        />
```

- [ ] **8.7** Update `app/src/components/HintSystem.vue` to accept `cityId` prop

Old:
```js
import { ref } from 'vue'
import { useGameStore } from '../stores/game.js'

const props = defineProps({
  hints: {
    type: Array,
    required: true
  },
  stageId: {
    type: [Number, String],
    required: true
  },
  stepId: {
    type: [Number, String],
    required: true
  }
})

const game = useGameStore()
```

New:
```js
import { ref } from 'vue'
import { useGameStore } from '../stores/game.js'

const props = defineProps({
  cityId: {
    type: String,
    required: true
  },
  hints: {
    type: Array,
    required: true
  },
  stageId: {
    type: [Number, String],
    required: true
  },
  stepId: {
    type: [Number, String],
    required: true
  }
})

const game = useGameStore(props.cityId)
```

Then in `Stage.vue` template, pass `cityId` to HintSystem:

Old:
```html
          <HintSystem
            :key="`hints-${currentStep}`"
            :hints="currentStepData.hints"
            :stage-id="stage.id"
            :step-id="currentStepData.id"
          />
```

New:
```html
          <HintSystem
            :key="`hints-${currentStep}`"
            :city-id="props.cityId"
            :hints="currentStepData.hints"
            :stage-id="stage.id"
            :step-id="currentStepData.id"
          />
```

**Commit:** `refactor: update all page components and shared components for city-awareness`

---

## Task 9: Backward compatibility & data migration

**Goal:** Detect old localStorage keys from the single-city version and auto-migrate them to the new multi-city format. Also migrate old IndexedDB data.

**File to create:** `app/src/utils/migration.js`
**File to modify:** `app/src/main.js`

### Steps

- [ ] **9.1** Create `app/src/utils/migration.js`

```js
// app/src/utils/migration.js

/**
 * Migrate legacy single-city data to the new multi-city format.
 *
 * Old keys:
 *   localStorage: 'seventh-cipher-game-state'
 *   IndexedDB:    'seventh-cipher-photos' database, 'photos' object store
 *
 * New keys:
 *   localStorage: 'ducheng_shanghai_state'
 *   IndexedDB:    'ducheng-photos' database, 'shanghai' object store
 *
 * This migration runs once on app startup. It copies (not moves) old data
 * to new keys, then sets a migration flag to avoid re-running.
 */

const MIGRATION_FLAG = 'ducheng_migration_v1_done'
const OLD_GAME_KEY = 'seventh-cipher-game-state'
const NEW_GAME_KEY = 'ducheng_shanghai_state'
const OLD_DB_NAME = 'seventh-cipher-photos'
const NEW_DB_NAME = 'ducheng-photos'

/**
 * Run all migrations. Safe to call multiple times -- exits early if already done.
 */
export async function runMigrations() {
  if (localStorage.getItem(MIGRATION_FLAG)) return

  migrateLocalStorage()
  await migrateIndexedDB()

  localStorage.setItem(MIGRATION_FLAG, new Date().toISOString())
}

/**
 * Migrate localStorage game state from old key to new key.
 */
function migrateLocalStorage() {
  const oldData = localStorage.getItem(OLD_GAME_KEY)
  if (!oldData) return

  // Only migrate if new key doesn't already have data
  if (!localStorage.getItem(NEW_GAME_KEY)) {
    localStorage.setItem(NEW_GAME_KEY, oldData)
    console.log('[migration] Migrated localStorage game state to ducheng_shanghai_state')
  }

  // Keep old key for 30 days, then it can be manually cleaned
  // We don't delete it immediately to allow rollback
}

/**
 * Migrate IndexedDB photos from old database to new database.
 */
async function migrateIndexedDB() {
  // Check if old database exists by trying to open it
  try {
    const oldPhotos = await readOldPhotos()
    if (!oldPhotos || Object.keys(oldPhotos).length === 0) return

    await writeNewPhotos(oldPhotos)
    console.log(`[migration] Migrated ${Object.keys(oldPhotos).length} photos to ducheng-photos/shanghai`)
  } catch (err) {
    console.warn('[migration] IndexedDB migration failed (non-fatal):', err)
  }
}

/**
 * Read all photos from the old IndexedDB database.
 * @returns {Promise<{[key: string]: Blob}|null>}
 */
function readOldPhotos() {
  return new Promise((resolve) => {
    const request = indexedDB.open(OLD_DB_NAME, 1)

    request.onerror = () => resolve(null)

    request.onupgradeneeded = (event) => {
      // Old DB doesn't exist, close and clean up
      event.target.transaction.abort()
      resolve(null)
    }

    request.onsuccess = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('photos')) {
        db.close()
        resolve(null)
        return
      }

      const tx = db.transaction('photos', 'readonly')
      const store = tx.objectStore('photos')
      const result = {}
      const cursorRequest = store.openCursor()

      cursorRequest.onsuccess = (e) => {
        const cursor = e.target.result
        if (cursor) {
          result[cursor.key] = cursor.value
          cursor.continue()
        } else {
          db.close()
          resolve(result)
        }
      }

      cursorRequest.onerror = () => {
        db.close()
        resolve(null)
      }
    }
  })
}

/**
 * Write photos into the new IndexedDB database under the 'shanghai' object store.
 * @param {{[key: string]: Blob}} photos
 */
function writeNewPhotos(photos) {
  return new Promise((resolve, reject) => {
    const CITY_STORES = ['shanghai', 'nanjing', 'hangzhou', 'xian']
    const request = indexedDB.open(NEW_DB_NAME, 2)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      for (const cityId of CITY_STORES) {
        if (!db.objectStoreNames.contains(cityId)) {
          db.createObjectStore(cityId)
        }
      }
    }

    request.onsuccess = (event) => {
      const db = event.target.result
      const tx = db.transaction('shanghai', 'readwrite')
      const store = tx.objectStore('shanghai')

      for (const [key, blob] of Object.entries(photos)) {
        store.put(blob, key)
      }

      tx.oncomplete = () => {
        db.close()
        resolve()
      }

      tx.onerror = (e) => {
        db.close()
        reject(e.target.error)
      }
    }

    request.onerror = (event) => reject(event.target.error)
  })
}
```

- [ ] **9.2** Update `app/src/main.js` to run migrations before mounting

Old:
```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router.js'
import './styles/theme.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

New:
```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router.js'
import { runMigrations } from './utils/migration.js'
import './styles/theme.css'

async function bootstrap() {
  // Run data migrations before app init (old single-city → multi-city)
  await runMigrations()

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
}

bootstrap()
```

- [ ] **9.3** Update `app/index.html` title

Old:
```html
    <title>第七封密电</title>
```

New:
```html
    <title>读城</title>
```

**Commit:** `feat: add backward-compatible data migration and update app bootstrap`

---

## Task 10: Verification

**Goal:** Verify the entire refactor works by running the build and performing manual testing.

### Steps

- [ ] **10.1** Run the Vite build to check for compilation errors

```bash
cd app && npm run build
```

Fix any import errors or missing references. Common issues to watch for:
- Old import paths like `'../data/puzzles.js'` or `'../data/narrative.js'` that weren't updated
- Missing `cityId` prop in component usage
- `useGameStore()` called without `cityId` argument

- [ ] **10.2** Start dev server and run manual test checklist

```bash
cd app && npm run dev
```

**Manual test checklist (Shanghai game):**

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| 1 | Open `http://localhost:3000` | Platform homepage shows 4 city cards | |
| 2 | Shanghai card shows "开始探索" | Card is clickable, others are dimmed | |
| 3 | Click Shanghai card | Navigates to `/#/city/shanghai`, shows game intro | |
| 4 | Click "接受任务" | Navigates to `/#/city/shanghai/stage/1` | |
| 5 | Stage 1 loads with correct title "和平饭店" | All step data renders | |
| 6 | Complete stage 1 steps | Fragment reveal shows "每一条路" | |
| 7 | Photo capture works | Photo saves, preview shows | |
| 8 | Transition to stage 2 | Transit page shows correct route info | |
| 9 | Continue through all 7 stages | Each stage loads correct data | |
| 10 | After stage 7, click "打开最后一页" | Finale page loads, acrostic reveal works | |
| 11 | Complete finale | Archive link appears | |
| 12 | Archive page loads | All 7 entries with photos and diary excerpts | |
| 13 | Refresh browser at any point | State persists, correct stage resumes | |
| 14 | Check localStorage | Key is `ducheng_shanghai_state` (not old key) | |
| 15 | Open old URL `/#/stage/3` | Redirects to `/#/city/shanghai/stage/3` | |
| 16 | Open old URL `/#/finale` | Redirects to `/#/city/shanghai/finale` | |
| 17 | Open old URL `/#/archive` | Redirects to `/#/city/shanghai/archive` | |

**Theme verification:**

| # | Test | Expected |
|---|------|----------|
| 1 | Platform homepage | Dark neutral theme, no paper texture |
| 2 | Shanghai game pages | Vintage archive theme (warm parchment colors) |
| 3 | Navigate back to platform home | Theme resets to dark neutral |

**Migration verification (if old data exists):**

| # | Test | Expected |
|---|------|----------|
| 1 | Set `localStorage.setItem('seventh-cipher-game-state', '{"currentStage":3}')` before loading app | After refresh, `ducheng_shanghai_state` contains the data |
| 2 | Old key still present | Not deleted (kept for rollback) |

- [ ] **10.3** Verify build output

```bash
cd app && npm run build
```

Expected: Build completes with no errors. Output in `app/dist/`.

- [ ] **10.4** Run preview to test production build

```bash
cd app && npm run preview
```

Repeat key items from the manual checklist above against the production build.

**Commit:** (no code changes -- verification task only)

---

## Summary of all commits

| Task | Commit message |
|------|---------------|
| 1 | `refactor: restructure data layer into cities/shanghai/ with city registry and useCityData composable` |
| 2 | `refactor: convert game store to per-city factory with isolated localStorage keys` |
| 3 | `refactor: namespace photo IndexedDB storage by cityId` |
| 4 | `refactor: add city-scoped routing with backward-compatible redirects` |
| 5 | `feat: add PlatformHome city selection page` |
| 6 | `feat: implement CSS theme system with per-city variables and dynamic switching` |
| 7 | `feat: add platform store for cross-city state tracking` |
| 8 | `refactor: update all page components and shared components for city-awareness` |
| 9 | `feat: add backward-compatible data migration and update app bootstrap` |
| 10 | (verification only, no commit) |

## File change summary

**New files (7):**
- `app/src/data/cities/index.js`
- `app/src/data/cities/useCityData.js`
- `app/src/data/cities/shanghai/puzzles.js` (moved from `app/src/data/puzzles.js`)
- `app/src/data/cities/shanghai/narrative.js` (moved from `app/src/data/narrative.js`)
- `app/src/pages/PlatformHome.vue`
- `app/src/stores/platform.js`
- `app/src/utils/migration.js`

**Modified files (11):**
- `app/src/router.js`
- `app/src/stores/game.js`
- `app/src/utils/photo-store.js`
- `app/src/App.vue`
- `app/src/main.js`
- `app/src/pages/Home.vue`
- `app/src/pages/Stage.vue`
- `app/src/pages/Transit.vue`
- `app/src/pages/Finale.vue`
- `app/src/pages/Archive.vue`
- `app/src/styles/theme.css`
- `app/src/components/PhotoCapture.vue`
- `app/src/components/HintSystem.vue`
- `app/index.html`

**Deleted files (2):**
- `app/src/data/puzzles.js` (moved to cities/shanghai/)
- `app/src/data/narrative.js` (moved to cities/shanghai/)
