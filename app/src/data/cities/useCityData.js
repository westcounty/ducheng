import { ref, shallowRef, watch, toValue } from 'vue'

const cache = {}

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
        prologue: puzzlesMod.PROLOGUE ?? null,
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

  watch(
    () => toValue(cityIdRef),
    (newId) => load(newId),
    { immediate: true }
  )

  return { cityData, loading, error }
}
