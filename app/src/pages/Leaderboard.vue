<template>
  <div class="explore-page">
    <header class="page-header">
      <button class="back-btn" @click="router.back()">&#x2190;</button>
      <h1 class="page-title">排行榜</h1>
    </header>

    <div class="lb-tabs">
      <button class="lb-tab" :class="{ active: tab === 'task' }" @click="tab = 'task'">任务排行</button>
      <button class="lb-tab" :class="{ active: tab === 'global' }" @click="tab = 'global'">总排行</button>
    </div>

    <!-- Task leaderboard -->
    <div v-if="tab === 'task'" class="lb-content">
      <div class="lb-task-select">
        <select v-model="selectedSlug" class="form-input" @change="loadTaskLeaderboard">
          <option value="">选择任务</option>
          <option v-for="t in tasks" :key="t.slug" :value="t.slug">{{ t.title }}</option>
        </select>
      </div>

      <div v-if="loading" class="loading-spinner">
        <div class="loading-spinner__ring"></div>
      </div>

      <div v-else-if="taskEntries.length > 0" class="lb-list">
        <div v-for="e in taskEntries" :key="e.rank" class="lb-entry">
          <span class="lb-entry__rank" :class="{ gold: e.rank === 1, silver: e.rank === 2, bronze: e.rank === 3 }">{{ e.rank }}</span>
          <span class="lb-entry__user">{{ e.userId }}</span>
          <span class="lb-entry__time">{{ e.durationMinutes }}min</span>
        </div>
      </div>
      <div v-else-if="selectedSlug" class="empty-state">
        <p class="empty-state__text">暂无完成记录</p>
      </div>
    </div>

    <!-- Global leaderboard -->
    <div v-if="tab === 'global'" class="lb-content">
      <div v-if="loading" class="loading-spinner">
        <div class="loading-spinner__ring"></div>
      </div>

      <div v-else-if="globalEntries.length > 0" class="lb-list">
        <div v-for="e in globalEntries" :key="e.rank" class="lb-entry">
          <span class="lb-entry__rank" :class="{ gold: e.rank === 1, silver: e.rank === 2, bronze: e.rank === 3 }">{{ e.rank }}</span>
          <span class="lb-entry__user">{{ e.userId }}</span>
          <span class="lb-entry__count">{{ e.completedTasks }} 个任务</span>
        </div>
      </div>
      <div v-else class="empty-state">
        <p class="empty-state__text">暂无排行数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchTasks, fetchTaskLeaderboard, fetchGlobalLeaderboard } from '../services/explore-api.js'

const router = useRouter()
const tab = ref('task')
const loading = ref(false)
const tasks = ref([])
const selectedSlug = ref('')
const taskEntries = ref([])
const globalEntries = ref([])

onMounted(async () => {
  try {
    const data = await fetchTasks({ pageSize: 50 })
    tasks.value = data.items || []
  } catch { /* ignore */ }

  loadGlobalLeaderboard()
})

async function loadTaskLeaderboard() {
  if (!selectedSlug.value) { taskEntries.value = []; return }
  loading.value = true
  try {
    const data = await fetchTaskLeaderboard(selectedSlug.value)
    taskEntries.value = data.entries || []
  } finally {
    loading.value = false
  }
}

async function loadGlobalLeaderboard() {
  loading.value = true
  try {
    const data = await fetchGlobalLeaderboard()
    globalEntries.value = data.entries || []
  } finally {
    loading.value = false
  }
}
</script>
