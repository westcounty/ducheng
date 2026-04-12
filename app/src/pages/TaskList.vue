<template>
  <div class="explore-page">
    <header class="page-header">
      <button class="back-btn" @click="router.push('/')">&#x2190;</button>
      <h1 class="page-title">探索任务</h1>
    </header>

    <!-- User bar -->
    <div class="explore-user-bar">
      <template v-if="auth.isAuthenticated">
        <span class="explore-user-name">{{ auth.displayName }}</span>
        <button class="explore-logout" @click="auth.logout()">退出</button>
      </template>
      <button v-else class="explore-login-btn" @click="goLogin">
        登录 / 注册
      </button>
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
import { useRouter } from 'vue-router'
import { useExploreStore } from '../stores/explore.js'
import { useAuthStore } from '../stores/auth.js'
import TaskCard from '../components/TaskCard.vue'

const FILTER_CITIES = [
  { id: 'shanghai', name: '上海' },
  { id: 'nanjing', name: '南京' },
  { id: 'hangzhou', name: '杭州' },
  { id: 'xian', name: '西安' },
  { id: 'suzhou', name: '苏州' },
]

const router = useRouter()
const store = useExploreStore()
const auth = useAuthStore()

const selectedCity = ref(null)

const hasMore = computed(() =>
  store.taskList.length < store.taskListTotal
)

onMounted(() => {
  store.loadTasks({ reset: true })
})

function goLogin() {
  router.push({ path: '/login', query: { redirect: '/explore' } })
}

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

.explore-user-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.explore-user-name {
  color: #8a7e6e;
  font-size: 13px;
}

.explore-logout {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #8a7e6e;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  cursor: pointer;
}

.explore-login-btn {
  background: linear-gradient(135deg, #e0c97f, #c9a84c);
  color: #1a1a2e;
  border: none;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 14px;
  cursor: pointer;
}
</style>
