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

  const completedCities = ref(saved?.completedCities ?? [])
  const easterEggUnlocked = reactive(saved?.easterEggUnlocked ?? {})

  const allCitiesCompleted = computed(() => completedCities.value.length >= 4)

  function persist() {
    const state = {
      completedCities: [...completedCities.value],
      easterEggUnlocked: { ...easterEggUnlocked }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  function markCityCompleted(cityId) {
    if (!completedCities.value.includes(cityId)) {
      completedCities.value.push(cityId)
      checkCrossCityUnlocks()
      persist()
    }
  }

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

  function isCityCompleted(cityId) {
    return completedCities.value.includes(cityId)
  }

  function resetPlatform() {
    completedCities.value = []
    Object.keys(easterEggUnlocked).forEach((k) => delete easterEggUnlocked[k])
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    completedCities, easterEggUnlocked, allCitiesCompleted,
    markCityCompleted, isCityCompleted, resetPlatform
  }
})
