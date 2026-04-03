<template>
  <div class="share-overlay" v-if="visible" @click.self="$emit('close')">
    <div class="share-card" ref="cardRef" :class="themeClass">
      <!-- Badge -->
      <div class="share-badge">
        <div class="share-badge-circle" :style="{ borderColor: badge.color, color: badge.color }">
          {{ badge.icon }}
        </div>
      </div>

      <!-- Title -->
      <div class="share-congrats">-- 恭喜你完成了 --</div>
      <div class="share-city-name text-display">「{{ scriptName }}·{{ cityName }}」</div>

      <!-- Photo -->
      <div class="share-photo" v-if="photoUrl">
        <img :src="photoUrl" alt="游戏照片" />
      </div>

      <!-- Quote -->
      <div class="share-quote text-handwriting">
        "{{ quote }}"
      </div>

      <!-- Stats -->
      <div class="share-stats">
        <div class="share-stat" v-if="duration">
          <span class="share-stat-label">完成时间</span>
          <span class="share-stat-value">{{ duration }}</span>
        </div>
        <div class="share-stat" v-if="hintsUsed !== null">
          <span class="share-stat-label">使用提示</span>
          <span class="share-stat-value">{{ hintsUsed }}次</span>
        </div>
        <div class="share-stat">
          <span class="share-stat-label">拍摄照片</span>
          <span class="share-stat-value">{{ photosCount }}张</span>
        </div>
      </div>

      <!-- Badge row -->
      <div class="share-badges-row">
        <span
          v-for="city in allCities"
          :key="city.id"
          class="share-mini-badge"
          :class="{ 'share-mini-badge--active': city.unlocked }"
          :style="city.unlocked ? { backgroundColor: city.color } : {}"
        >
          {{ city.unlocked ? city.icon : '·' }}
        </span>
      </div>

      <!-- Branding -->
      <div class="share-brand">
        <div class="share-brand-name">读城 · ducheng</div>
        <div class="share-brand-cta">扫码开始你的城市解谜</div>
      </div>
    </div>

    <!-- Actions -->
    <div class="share-actions">
      <button class="btn-primary" @click="saveAsImage">保存图片</button>
      <button class="btn-secondary" @click="$emit('close')">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePlatformStore, BADGE_DEFINITIONS, SHARE_QUOTES } from '../stores/platform.js'
import { getCity, CITIES } from '../data/cities/index.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  cityId: { type: String, required: true },
  photoUrl: { type: String, default: '' },
  duration: { type: String, default: '' },
  hintsUsed: { type: Number, default: null },
  photosCount: { type: Number, default: 7 }
})

defineEmits(['close'])

const platform = usePlatformStore()
const cardRef = ref(null)

const city = computed(() => getCity(props.cityId))
const cityName = computed(() => city.value?.name ?? '')
const scriptName = computed(() => city.value?.scriptName ?? '')
const themeClass = computed(() => city.value?.themeClass ?? 'theme-default')
const badge = computed(() => BADGE_DEFINITIONS[props.cityId] ?? { icon: '?', color: '#999' })
const quote = computed(() => SHARE_QUOTES[props.cityId] ?? '')

const allCities = computed(() =>
  CITIES.map((c) => ({
    id: c.id,
    icon: BADGE_DEFINITIONS[c.id]?.icon ?? '?',
    color: BADGE_DEFINITIONS[c.id]?.color ?? '#999',
    unlocked: platform.isBadgeUnlocked(c.id)
  }))
)

async function saveAsImage() {
  if (!cardRef.value) return
  try {
    // Use Canvas API to capture card as image
    const canvas = document.createElement('canvas')
    const rect = cardRef.value.getBoundingClientRect()
    const scale = 2 // retina
    canvas.width = rect.width * scale
    canvas.height = rect.height * scale
    const ctx = canvas.getContext('2d')
    ctx.scale(scale, scale)

    // Draw background
    const bgColor = getComputedStyle(cardRef.value).backgroundColor
    ctx.fillStyle = bgColor || '#f5f0e8'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Use html2canvas-like approach via foreignObject SVG
    const data = new XMLSerializer().serializeToString(cardRef.value)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">${data}</div>
      </foreignObject>
    </svg>`
    const img = new Image()
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      // Trigger download
      const link = document.createElement('a')
      link.download = `读城-${cityName.value}-通关卡.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = url
  } catch (e) {
    // Fallback: prompt user to screenshot
    alert('请长按截图保存分享卡片')
  }
}
</script>

<style scoped>
.share-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  overflow-y: auto;
}

.share-card {
  width: 100%;
  max-width: 375px;
  background: var(--bg-primary);
  background-image: var(--paper-texture);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl) var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-lg);
  color: var(--text-primary);
}

.share-badge {
  margin-bottom: var(--spacing-sm);
}

.share-badge-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-family: var(--font-display);
  font-weight: 700;
  background: var(--bg-secondary);
  box-shadow: 0 0 20px rgba(196, 163, 90, 0.2);
}

.share-congrats {
  font-size: 0.8rem;
  color: var(--text-secondary);
  letter-spacing: 0.15em;
}

.share-city-name {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-align: center;
}

.share-photo {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
}

.share-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.share-quote {
  font-size: 1rem;
  line-height: 1.8;
  text-align: center;
  color: var(--text-primary);
  padding: 0 var(--spacing-sm);
  opacity: 0.9;
}

.share-stats {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-sm) 0;
  border-top: 1px dashed var(--border);
  border-bottom: 1px dashed var(--border);
  width: 100%;
  justify-content: center;
}

.share-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.share-stat-label {
  font-size: 0.65rem;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

.share-stat-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent);
}

.share-badges-row {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
}

.share-mini-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  background: var(--border);
}

.share-mini-badge--active {
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.15);
}

.share-brand {
  text-align: center;
  padding-top: var(--spacing-sm);
}

.share-brand-name {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-primary);
}

.share-brand-cta {
  font-size: 0.65rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.share-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}
</style>
