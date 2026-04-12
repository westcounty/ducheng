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
 */
async function toDataUrl() {
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
