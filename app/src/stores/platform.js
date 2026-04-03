import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

const STORAGE_KEY = 'ducheng_platform_state'

/** Badge definitions for each city */
export const BADGE_DEFINITIONS = {
  shanghai: { name: '密电已阅', icon: '密', color: '#8b4513', description: '武康大楼船头剪影' },
  nanjing:  { name: '刻痕永存', icon: '刻', color: '#8b1a1a', description: '中华门瓮城俯视轮廓' },
  hangzhou: { name: '桥未断',   icon: '桥', color: '#7a9e7e', description: '断桥弧线与雪花纹' },
  xian:     { name: '赴宴人',   icon: '宴', color: '#d4a020', description: '小雁塔与新月' },
  suzhou:   { name: '入梦者',   icon: '梦', color: '#4a6fa5', description: '月洞门框与一枝梅' }
}

/** Share card quote for each city */
export const SHARE_QUOTES = {
  shanghai: '情报的最后一行，写的不是暗号，而是一句再见。',
  nanjing:  '这些人真的存在过。六百年了，他们的名字还在。',
  hangzhou: '我见过一千年的西湖。但值得留下来的理由，只需要一个下午。',
  xian:     '等了一千三百年，终于凑齐一桌人。',
  suzhou:   '台上的人散了，台下那个人也散了。但这座园是我的。'
}

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
  const badges = reactive(saved?.badges ?? {})
  const sharePreferences = reactive(saved?.sharePreferences ?? {})

  const allCitiesCompleted = computed(() => completedCities.value.length >= 4)

  function persist() {
    const state = {
      completedCities: [...completedCities.value],
      easterEggUnlocked: { ...easterEggUnlocked },
      badges: { ...badges },
      sharePreferences: { ...sharePreferences }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  function markCityCompleted(cityId) {
    if (!completedCities.value.includes(cityId)) {
      completedCities.value.push(cityId)
      unlockBadge(cityId)
      checkCrossCityUnlocks()
      persist()
    }
  }

  function unlockBadge(cityId) {
    if (!badges[cityId]) {
      badges[cityId] = { unlocked: true, unlockedAt: Date.now() }
    }
  }

  function isBadgeUnlocked(cityId) {
    return !!badges[cityId]?.unlocked
  }

  function getBadgeInfo(cityId) {
    const def = BADGE_DEFINITIONS[cityId]
    if (!def) return null
    return { ...def, unlocked: isBadgeUnlocked(cityId), unlockedAt: badges[cityId]?.unlockedAt }
  }

  function setSharePhoto(cityId, stageId) {
    sharePreferences[cityId] = { selectedPhotoStage: stageId }
    persist()
  }

  const allBadgesUnlocked = computed(() =>
    Object.keys(BADGE_DEFINITIONS).every((id) => badges[id]?.unlocked)
  )

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
    completedCities, easterEggUnlocked, badges, sharePreferences,
    allCitiesCompleted, allBadgesUnlocked,
    markCityCompleted, isCityCompleted, resetPlatform,
    unlockBadge, isBadgeUnlocked, getBadgeInfo, setSharePhoto
  }
})
