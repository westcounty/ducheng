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
      <!-- Server-generated image takes priority -->
      <div v-if="posterData.imageUrl" class="poster-image-wrapper">
        <img :src="posterData.imageUrl" class="poster-image" crossorigin="anonymous" />
      </div>

      <!-- Fallback: client-side rendered poster -->
      <PosterCanvas v-else ref="posterRef" :poster="posterData" />

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
  saving.value = true

  try {
    // If server-generated image exists, download it directly
    if (posterData.value?.imageUrl) {
      const resp = await fetch(posterData.value.imageUrl)
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `ducheng-explore-${props.slug}.png`
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return
    }

    // Fallback: client-side html2canvas
    if (!posterRef.value) return
    const dataUrl = await posterRef.value.toDataUrl()
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
