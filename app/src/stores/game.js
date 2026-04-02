// app/src/stores/game.js

import { defineStore } from 'pinia'
import { computed, ref, reactive } from 'vue'

const storeRegistry = {}

export function useGameStore(cityId) {
  if (!cityId) {
    throw new Error('useGameStore requires a cityId argument')
  }

  if (!storeRegistry[cityId]) {
    const storeName = `game-${cityId}`
    const STORAGE_KEY = `ducheng_${cityId}_state`

    storeRegistry[cityId] = defineStore(storeName, () => {
      function loadFromStorage() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          return raw ? JSON.parse(raw) : null
        } catch {
          return null
        }
      }

      const saved = loadFromStorage()

      const currentStage = ref(saved?.currentStage ?? 0)
      const currentStep = ref(saved?.currentStep ?? 0)
      const cipherFragments = reactive(saved?.cipherFragments ?? {})
      const photosTaken = reactive(saved?.photosTaken ?? [])
      const hintsUsed = reactive(saved?.hintsUsed ?? {})
      const startTime = ref(saved?.startTime ?? null)
      const stageStartTimes = reactive(saved?.stageStartTimes ?? {})
      const stageClearTimes = reactive(saved?.stageClearTimes ?? {})

      const isStarted = computed(() => startTime.value !== null)
      const isFinished = computed(() => currentStage.value === 8 && stageClearTimes[8] !== undefined)
      const collectedCount = computed(() => Object.keys(cipherFragments).length)

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

      function recordPhoto(stageId) {
        if (!photosTaken.includes(stageId)) {
          photosTaken.push(stageId)
        }
        persist()
      }

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
        currentStage, currentStep, cipherFragments, photosTaken,
        hintsUsed, startTime, stageStartTimes, stageClearTimes,
        isStarted, isFinished, collectedCount,
        startGame, advanceStep, completeStage, goToNextStage,
        enterFinale, completeGame, recordPhoto, useHint, resetGame
      }
    })
  }

  return storeRegistry[cityId]()
}
