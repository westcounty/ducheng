<template>
  <div class="play-page">
    <!-- Header -->
    <div class="play-header">
      <button class="play-header__back" @click="goBack">&#x2190;</button>
      <span class="play-header__title">
        {{ store.currentTask?.title || '探索中' }}
      </span>
      <span style="width: 32px;"></span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-spinner" style="flex: 1;">
      <div class="loading-spinner__ring"></div>
    </div>

    <!-- Completed — redirect to poster -->
    <div
      v-else-if="store.isTaskCompleted"
      class="play-content"
      style="align-items: center; justify-content: center;"
    >
      <div class="submit-feedback submit-feedback--success" style="width: 100%;">
        <p class="submit-feedback__title">&#x1F389; 探索完成!</p>
        <p class="submit-feedback__text">所有任务步骤已完成</p>
      </div>
      <button
        class="cta-btn cta-btn--primary"
        style="margin-top: 16px;"
        @click="router.push(`/explore/${slug}/poster`)"
      >
        查看成就海报
      </button>
    </div>

    <!-- Active sub-task -->
    <template v-else-if="subTask">
      <div class="play-content">
        <!-- Sub-task title -->
        <h2 style="font-size: 1.1rem; font-weight: 600; color: #e8e0d4;">
          {{ subTask.title }}
        </h2>

        <!-- Location info -->
        <div v-if="subTask.locationName" class="play-location">
          &#x1F4CD; {{ subTask.locationName }}
          <span v-if="subTask.locationAddress" style="opacity: 0.7; font-size: 0.8rem;">
            &middot; {{ subTask.locationAddress }}
          </span>
        </div>

        <!-- Instruction -->
        <div class="play-instruction">{{ subTask.instruction }}</div>

        <!-- Type-specific input -->
        <PhotoSubmit
          v-if="subTask.type === 'photo'"
          :slug="slug"
          @submitted="onSubTaskDone"
        />

        <ArrivalCheck
          v-if="subTask.type === 'arrival'"
          :slug="slug"
          :location-name="subTask.locationName || '目标位置'"
          :location-address="subTask.locationAddress || ''"
          :target-lat="subTask.locationLat ? Number(subTask.locationLat) : null"
          :target-lng="subTask.locationLng ? Number(subTask.locationLng) : null"
          @submitted="onSubTaskDone"
        />

        <PuzzleInput
          v-if="subTask.type === 'puzzle'"
          :slug="slug"
          @submitted="onSubTaskDone"
        />

        <QuizInput
          v-if="subTask.type === 'quiz'"
          :slug="slug"
          :options="quizOptions"
          @submitted="onSubTaskDone"
        />
      </div>

      <!-- Progress chain at bottom -->
      <div class="play-footer">
        <SubTaskProgress
          :total="store.totalSubTasks"
          :current-index="store.currentIndex"
        />
      </div>
    </template>

    <!-- Error / no sub-task -->
    <div v-else class="empty-state" style="flex: 1;">
      <div class="empty-state__icon">&#x26A0;</div>
      <p class="empty-state__text">无法加载任务步骤</p>
      <button
        class="cta-btn cta-btn--primary"
        style="margin-top: 16px; width: auto; padding: 12px 32px;"
        @click="reload"
      >
        重试
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExploreStore } from '../stores/explore.js'
import PhotoSubmit from '../components/PhotoSubmit.vue'
import ArrivalCheck from '../components/ArrivalCheck.vue'
import PuzzleInput from '../components/PuzzleInput.vue'
import QuizInput from '../components/QuizInput.vue'
import SubTaskProgress from '../components/SubTaskProgress.vue'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const store = useExploreStore()
const loading = ref(true)

const subTask = computed(() => store.currentSubTask)

const quizOptions = computed(() => {
  if (subTask.value?.type !== 'quiz') return []
  return subTask.value.validationConfig?.options || []
})

onMounted(async () => {
  await reload()
})

async function reload() {
  loading.value = true
  try {
    // Load task detail if not loaded
    if (!store.currentTask || store.currentTask.slug !== props.slug) {
      await store.loadTaskDetail(props.slug)
    }
    // Load current progress
    await store.loadProgress(props.slug)
  } catch (err) {
    console.error('Failed to load task play state:', err)
  } finally {
    loading.value = false
  }
}

function onSubTaskDone(result) {
  if (result?.taskCompleted) {
    // Task completed — navigate to poster
    router.push(`/explore/${props.slug}/poster`)
  }
  // Otherwise, the store already advanced to the next sub-task
}

function goBack() {
  router.push(`/explore/${props.slug}`)
}
</script>
