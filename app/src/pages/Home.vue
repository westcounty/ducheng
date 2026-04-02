<template>
  <div class="home page-padding">
    <!-- Header -->
    <header class="home-header">
      <div class="title-stamp animate-stamp">
        <span class="stamp stamp--accent">机密档案</span>
      </div>
      <h1 class="home-title">第七封密电</h1>
      <p class="home-subtitle text-secondary">上海·1943</p>
    </header>

    <hr class="divider" />

    <!-- Loading city data -->
    <template v-if="loading">
      <p class="text-secondary">载入中...</p>
    </template>

    <!-- Not started: show intro story then action button -->
    <template v-else-if="!game.isStarted">
      <div class="intro-area">
        <NarrativeText
          :text="INTRO_STORY"
          :speed="500"
          @complete="introComplete = true"
        />
      </div>

      <transition name="btn-rise">
        <div v-if="introComplete" class="action-area animate-fade-in">
          <button class="btn-primary action-btn" @click="acceptMission">
            接受任务
          </button>
        </div>
      </transition>
    </template>

    <!-- Already started: show progress and resume -->
    <template v-else-if="game.isStarted">
      <div class="progress-area cipher-card">
        <p class="progress-label">任务进行中</p>
        <div class="progress-stats">
          <div class="stat">
            <span class="stat-value">{{ game.currentStage }}</span>
            <span class="stat-unit">/ 7</span>
            <span class="stat-label">当前站点</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-value">{{ game.collectedCount }}</span>
            <span class="stat-unit">/ 7</span>
            <span class="stat-label">密电碎片</span>
          </div>
        </div>

        <div v-if="game.isFinished" class="finished-note text-accent">
          任务档案已完成 — 前往鹤影档案
        </div>
      </div>

      <div class="action-area">
        <button
          v-if="game.isFinished"
          class="btn-primary action-btn"
          @click="goToArchive"
        >
          查看鹤影档案
        </button>
        <button v-else class="btn-primary action-btn" @click="continueGame">
          继续任务
        </button>

        <button class="btn-link reset-link" @click="confirmReset">
          重新开始
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { useCityData } from '../data/cities/useCityData.js'
import NarrativeText from '../components/NarrativeText.vue'

const props = defineProps({ cityId: { type: String, required: true } })

const game = useGameStore(props.cityId)
const router = useRouter()
const { cityData, loading } = useCityData(computed(() => props.cityId))
const INTRO_STORY = computed(() => cityData.value?.introStory ?? '')

const introComplete = ref(false)

function acceptMission() {
  game.startGame()
  router.push(`/city/${props.cityId}/stage/1`)
}

function continueGame() {
  if (game.currentStage >= 8) {
    router.push(`/city/${props.cityId}/finale`)
  } else {
    router.push(`/city/${props.cityId}/stage/${game.currentStage}`)
  }
}

function goToArchive() {
  router.push(`/city/${props.cityId}/archive`)
}

function confirmReset() {
  if (confirm('确定要重新开始吗？所有进度将被清除。')) {
    game.resetGame()
    introComplete.value = false
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.home-header {
  text-align: center;
  padding: var(--spacing-xl) 0 var(--spacing-md);
}

.title-stamp {
  margin-bottom: var(--spacing-md);
}

.home-title {
  font-family: var(--font-body);
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-sm);
}

.home-subtitle {
  font-size: 0.9rem;
  letter-spacing: 0.2em;
}

.intro-area {
  flex: 1;
  padding: var(--spacing-md) 0;
  font-size: 0.95rem;
  line-height: 1.9;
}

.action-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl) 0;
}

.action-btn {
  width: 100%;
  max-width: 280px;
  padding: 14px;
  font-size: 1.05rem;
  letter-spacing: 0.15em;
}

.btn-link {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: 4px;
  -webkit-tap-highlight-color: transparent;
}

.progress-area {
  margin: var(--spacing-md) 0;
}

.progress-label {
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  color: var(--accent);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  text-transform: uppercase;
}

.progress-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.stat-unit {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-left: 2px;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background-color: var(--border);
}

.finished-note {
  margin-top: var(--spacing-md);
  font-size: 0.85rem;
  text-align: center;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border);
}

.btn-rise-enter-active {
  transition: all 0.5s ease;
}

.btn-rise-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
</style>
