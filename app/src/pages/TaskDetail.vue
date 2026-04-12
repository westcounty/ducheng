<template>
  <div class="explore-page" style="padding: 0;">
    <!-- Loading -->
    <div v-if="store.taskLoading" class="loading-spinner" style="min-height: 100vh;">
      <div class="loading-spinner__ring"></div>
    </div>

    <template v-else-if="task">
      <!-- Hero cover -->
      <div class="task-hero">
        <img
          v-if="task.coverImage"
          :src="task.coverImage"
          :alt="task.title"
          class="task-hero__image"
        />
        <div v-else class="task-hero__image-placeholder"></div>
        <div class="task-hero__gradient"></div>
        <button class="task-hero__back" @click="router.push('/explore')">&#x2190;</button>
      </div>

      <!-- Info -->
      <div style="padding: 0 var(--spacing-md) var(--spacing-lg);">
        <div class="task-info">
          <h1 class="task-info__title">{{ task.title }}</h1>

          <div class="task-info__stats">
            <div class="task-info__stat">
              <span class="task-info__stat-value">{{ task.totalSubTasks }}</span>
              <span class="task-info__stat-label">步骤</span>
            </div>
            <div class="task-info__stat">
              <span class="task-info__stat-value">{{ task.estimatedMinutes || '?' }}min</span>
              <span class="task-info__stat-label">预计用时</span>
            </div>
            <div v-if="task.difficulty" class="task-info__stat">
              <span :class="`diff-badge diff-badge--${task.difficulty}`">{{ difficultyLabel }}</span>
              <span class="task-info__stat-label">难度</span>
            </div>
            <div class="task-info__stat">
              <span class="task-info__stat-value">{{ task.completionCount || 0 }}</span>
              <span class="task-info__stat-label">已完成</span>
            </div>
          </div>

          <p class="task-info__desc">{{ task.description }}</p>

          <!-- Sub-task overview -->
          <div v-if="task.subTasks?.length" class="task-info__locations">
            <div
              v-for="(sub, i) in task.subTasks"
              :key="sub.id"
              class="task-info__location-item"
            >
              <span class="task-info__location-icon">&#x25CB;</span>
              <span>{{ sub.locationName || `步骤 ${i + 1}` }}</span>
            </div>
          </div>

          <!-- Progress info if in progress -->
          <div
            v-if="progressStatus === 'in_progress'"
            style="padding: 12px; background: rgba(74,124,89,0.1); border-radius: 8px; text-align: center; color: #6abf7b; font-size: 0.85rem;"
          >
            &#x25B6; 进行中 · 第 {{ progressIndex }} / {{ task.totalSubTasks }} 步
          </div>

          <!-- CTA -->
          <button
            v-if="progressStatus === 'in_progress'"
            class="cta-btn cta-btn--continue"
            @click="goPlay"
          >
            继续探索
          </button>
          <button
            v-else-if="progressStatus === 'completed'"
            class="cta-btn cta-btn--primary"
            @click="router.push(`/explore/${slug}/poster`)"
          >
            查看成就
          </button>
          <button
            v-else
            class="cta-btn cta-btn--primary"
            :disabled="startLoading"
            @click="handleStart"
          >
            {{ startLoading ? '加载中...' : '开始探索' }}
          </button>
        </div>
      </div>
    </template>

    <!-- Not found -->
    <div v-else class="empty-state" style="min-height: 100vh;">
      <div class="empty-state__icon">&#x2753;</div>
      <p class="empty-state__text">任务不存在</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExploreStore } from '../stores/explore.js'
import { isLoggedIn } from '../services/explore-api.js'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const store = useExploreStore()
const startLoading = ref(false)

const task = computed(() => store.currentTask)
const progressStatus = computed(() => store.progress?.status || null)
const progressIndex = computed(() => store.progress?.currentSubTaskIndex || 0)

const DIFFICULTY_MAP = { easy: '轻松', medium: '适中', hard: '挑战' }
const difficultyLabel = computed(() =>
  DIFFICULTY_MAP[task.value?.difficulty] || task.value?.difficulty || ''
)

onMounted(async () => {
  store.resetTaskState()
  await store.loadTaskDetail(props.slug)

  // Try to load progress if logged in
  if (isLoggedIn()) {
    try {
      await store.loadProgress(props.slug)
    } catch {
      // Not started — that's fine
    }
  }
})

async function handleStart() {
  if (!isLoggedIn()) {
    router.push({ path: '/explore', query: { login: '1' } })
    return
  }

  startLoading.value = true
  try {
    await store.doStartTask(props.slug)
    goPlay()
  } catch (err) {
    if (err.status === 409) {
      // Already started, go to play
      goPlay()
    }
  } finally {
    startLoading.value = false
  }
}

function goPlay() {
  router.push(`/explore/${props.slug}/play`)
}
</script>
