<template>
  <div class="explore-page">
    <header class="page-header">
      <button class="back-btn" @click="router.push('/')">&#x2190;</button>
      <h1 class="page-title">探索任务</h1>
    </header>

    <!-- Auth prompt (shown when redirected with login=1) -->
    <div v-if="showLoginPrompt" class="auth-prompt">
      <p class="auth-prompt__text">请先登录后再开始任务</p>
      <p class="auth-prompt__hint">登录后可开始探索、提交任务并收集徽章</p>
    </div>

    <!-- City filter -->
    <div class="filter-pills">
      <button
        class="filter-pill"
        :class="{ 'filter-pill--active': !selectedCity }"
        @click="filterByCity(null)"
      >
        全部
      </button>
      <button
        v-for="city in FILTER_CITIES"
        :key="city.id"
        class="filter-pill"
        :class="{ 'filter-pill--active': selectedCity === city.id }"
        @click="filterByCity(city.id)"
      >
        {{ city.name }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.taskListLoading && store.taskList.length === 0" class="loading-spinner">
      <div class="loading-spinner__ring"></div>
    </div>

    <!-- Task list -->
    <div v-else-if="store.taskList.length > 0" class="task-list">
      <TaskCard
        v-for="task in store.taskList"
        :key="task.id"
        :task="task"
        @click="goToTask(task.slug)"
      />

      <!-- Load more -->
      <button
        v-if="hasMore"
        class="cta-btn cta-btn--primary"
        style="margin-top: 8px;"
        :disabled="store.taskListLoading"
        @click="loadMore"
      >
        {{ store.taskListLoading ? '加载中...' : '加载更多' }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-state__icon">&#x1F30D;</div>
      <p class="empty-state__text">暂无探索任务</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExploreStore } from '../stores/explore.js'
import TaskCard from '../components/TaskCard.vue'

const FILTER_CITIES = [
  { id: 'shanghai', name: '上海' },
  { id: 'nanjing', name: '南京' },
  { id: 'hangzhou', name: '杭州' },
  { id: 'xian', name: '西安' },
  { id: 'suzhou', name: '苏州' },
]

const router = useRouter()
const route = useRoute()
const store = useExploreStore()

const selectedCity = ref(null)
const showLoginPrompt = ref(route.query.login === '1')

const hasMore = computed(() =>
  store.taskList.length < store.taskListTotal
)

onMounted(() => {
  store.loadTasks({ reset: true })
})

function filterByCity(city) {
  selectedCity.value = city
  store.loadTasks({ city, reset: true })
}

function loadMore() {
  store.loadTasks({
    city: selectedCity.value,
    page: store.taskListPage + 1,
  })
}

function goToTask(slug) {
  router.push(`/explore/${slug}`)
}
</script>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
}
</style>
