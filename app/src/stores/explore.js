// app/src/stores/explore.js
// Pinia store for the exploration task module.
// Manages task list, current task, progress, and badges.

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchTasks,
  fetchTaskDetail,
  startTask,
  fetchProgress,
  submitSubTask,
  uploadPhoto,
  fetchPoster,
  fetchBadges,
  isLoggedIn,
} from '../services/explore-api.js'

export const useExploreStore = defineStore('explore', () => {
  // ─── Task list state ──────────────────────────────────

  const taskList = ref([])
  const taskListTotal = ref(0)
  const taskListPage = ref(1)
  const taskListLoading = ref(false)
  const taskListCity = ref(null)

  async function loadTasks({ city, page = 1, reset = false } = {}) {
    taskListLoading.value = true
    try {
      const data = await fetchTasks({ city, page })
      if (reset) {
        taskList.value = data.items
      } else {
        taskList.value = [...taskList.value, ...data.items]
      }
      taskListTotal.value = data.total
      taskListPage.value = data.page
      taskListCity.value = city || null
    } finally {
      taskListLoading.value = false
    }
  }

  // ─── Current task detail ──────────────────────────────

  const currentTask = ref(null)
  const taskLoading = ref(false)

  async function loadTaskDetail(slug) {
    taskLoading.value = true
    try {
      currentTask.value = await fetchTaskDetail(slug)
    } finally {
      taskLoading.value = false
    }
  }

  // ─── Progress state ───────────────────────────────────

  const progress = ref(null)
  const currentSubTask = ref(null)
  const totalSubTasks = ref(0)
  const progressLoading = ref(false)
  const submitLoading = ref(false)
  const submitResult = ref(null)

  const isTaskCompleted = computed(() => progress.value?.status === 'completed')
  const currentIndex = computed(() => progress.value?.currentSubTaskIndex ?? 0)

  async function doStartTask(slug) {
    progressLoading.value = true
    try {
      const data = await startTask(slug)
      progress.value = data.progress
      currentSubTask.value = data.currentSubTask
      return data
    } finally {
      progressLoading.value = false
    }
  }

  async function loadProgress(slug) {
    progressLoading.value = true
    try {
      const data = await fetchProgress(slug)
      progress.value = data.progress
      currentSubTask.value = data.currentSubTask || null
      totalSubTasks.value = data.totalSubTasks || 0

      if (data.completed) {
        return { completed: true }
      }
      return data
    } catch (err) {
      if (err.status === 404) {
        progress.value = null
        currentSubTask.value = null
      }
      throw err
    } finally {
      progressLoading.value = false
    }
  }

  async function doSubmit(slug, payload) {
    submitLoading.value = true
    submitResult.value = null
    try {
      const data = await submitSubTask(slug, payload)
      submitResult.value = data

      if (data.approved && !data.taskCompleted) {
        currentSubTask.value = data.nextSubTask
        if (progress.value) {
          progress.value = {
            ...progress.value,
            currentSubTaskIndex: progress.value.currentSubTaskIndex + 1,
          }
        }
      }

      if (data.taskCompleted) {
        if (progress.value) {
          progress.value = { ...progress.value, status: 'completed' }
        }
      }

      return data
    } finally {
      submitLoading.value = false
    }
  }

  async function doUploadPhoto(file) {
    return uploadPhoto(file)
  }

  // ─── Poster ───────────────────────────────────────────

  const poster = ref(null)
  const posterLoading = ref(false)

  async function loadPoster(slug) {
    posterLoading.value = true
    try {
      poster.value = await fetchPoster(slug)
    } finally {
      posterLoading.value = false
    }
  }

  // ─── Badges ───────────────────────────────────────────

  const badges = ref([])
  const badgesLoading = ref(false)

  async function loadBadges() {
    badgesLoading.value = true
    try {
      const data = await fetchBadges()
      badges.value = data.badges || data || []
    } finally {
      badgesLoading.value = false
    }
  }

  // ─── Auth convenience ─────────────────────────────────

  const loggedIn = computed(() => isLoggedIn())

  // ─── Reset ────────────────────────────────────────────

  function resetTaskState() {
    currentTask.value = null
    progress.value = null
    currentSubTask.value = null
    totalSubTasks.value = 0
    submitResult.value = null
    poster.value = null
  }

  return {
    taskList, taskListTotal, taskListPage, taskListLoading, taskListCity,
    loadTasks,
    currentTask, taskLoading,
    loadTaskDetail,
    progress, currentSubTask, totalSubTasks,
    progressLoading, submitLoading, submitResult,
    isTaskCompleted, currentIndex,
    doStartTask, loadProgress, doSubmit, doUploadPhoto,
    poster, posterLoading,
    loadPoster,
    badges, badgesLoading,
    loadBadges,
    loggedIn,
    resetTaskState,
  }
})
