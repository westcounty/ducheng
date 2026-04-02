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
