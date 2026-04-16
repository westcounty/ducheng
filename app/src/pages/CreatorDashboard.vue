<template>
  <div class="explore-page">
    <header class="page-header">
      <button class="back-btn" @click="router.push('/explore')">&#x2190;</button>
      <h1 class="page-title">我的任务</h1>
    </header>

    <div v-if="loading" class="loading-spinner">
      <div class="loading-spinner__ring"></div>
    </div>

    <template v-else>
      <div v-if="taskList.length === 0" class="empty-state">
        <div class="empty-state__icon">&#x270F;</div>
        <p class="empty-state__text">还没有创建过任务</p>
        <button class="cta-btn cta-btn--primary" @click="router.push('/create')">创建任务</button>
      </div>

      <div v-else class="creator-list">
        <div v-for="task in taskList" :key="task.id" class="creator-card" @click="viewStats(task)">
          <div class="creator-card__info">
            <h3 class="creator-card__title">{{ task.title }}</h3>
            <p class="creator-card__city">{{ task.city }} · {{ task.subTaskCount }} 步</p>
          </div>
          <StatusBadge :status="task.status" />
        </div>
      </div>

      <button class="cta-btn cta-btn--secondary" style="margin-top:16px;" @click="router.push('/create')">+ 创建新任务</button>

      <!-- Stats modal -->
      <div v-if="statsTask" class="stats-overlay" @click.self="statsTask = null">
        <div class="stats-card">
          <h3 class="stats-card__title">{{ statsTask.title }}</h3>
          <div class="stats-card__grid">
            <div class="stats-card__item">
              <div class="stats-card__value">{{ statsData.completionCount || 0 }}</div>
              <div class="stats-card__label">完成人数</div>
            </div>
            <div class="stats-card__item">
              <div class="stats-card__value">{{ statsData.avgRating || '-' }}</div>
              <div class="stats-card__label">评分</div>
            </div>
            <div class="stats-card__item">
              <div class="stats-card__value">{{ statsData.ratingCount || 0 }}</div>
              <div class="stats-card__label">评分数</div>
            </div>
          </div>
          <button class="cta-btn" style="background:#333;color:#aaa;" @click="statsTask = null">关闭</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchMyCreatedTasks, fetchMyTaskStats } from '../services/explore-api.js'
import StatusBadge from '../components/StatusBadge.vue'

const router = useRouter()
const loading = ref(true)
const taskList = ref([])
const statsTask = ref(null)
const statsData = ref({})

onMounted(async () => {
  try {
    const data = await fetchMyCreatedTasks()
    taskList.value = data.items || []
  } finally {
    loading.value = false
  }
})

async function viewStats(task) {
  statsTask.value = task
  try {
    statsData.value = await fetchMyTaskStats(task.id)
  } catch {
    statsData.value = {}
  }
}
</script>
