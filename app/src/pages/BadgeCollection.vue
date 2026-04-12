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
