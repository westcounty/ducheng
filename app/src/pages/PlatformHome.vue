<template>
  <div class="platform-home page-padding">
    <header class="platform-header">
      <h1 class="platform-title">读城</h1>
      <p class="platform-subtitle text-secondary">
        在一座城市里走一条路，解一个人留下的谜。
      </p>
    </header>

    <hr class="divider" />

    <div class="city-grid">
      <div
        v-for="city in CITIES"
        :key="city.id"
        class="city-card cipher-card"
        :class="{
          'city-card--available': city.available,
          'city-card--disabled': !city.available,
          [`city-accent--${city.id}`]: true
        }"
        @click="enterCity(city)"
      >
        <div class="card-body">
          <h2 class="card-city-name">{{ city.name }}</h2>
          <p class="card-script-name">{{ city.scriptName }}</p>
          <p class="card-tagline text-secondary">
            「{{ city.tagline }}」
          </p>
        </div>

        <div class="card-footer">
          <template v-if="!city.available">
            <span class="card-status card-status--coming">即将开放</span>
          </template>
          <template v-else-if="isCityCompleted(city.id)">
            <span class="card-status card-status--done stamp stamp--success">已通关</span>
          </template>
          <template v-else-if="isCityStarted(city.id)">
            <span class="card-status card-status--progress">继续游戏</span>
          </template>
          <template v-else>
            <span class="card-status card-status--new">开始探索</span>
          </template>
        </div>
      </div>
    </div>

    <!-- Badge collection -->
    <BadgeDisplay title="城市徽章" :show-ultimate="true" />

    <footer class="platform-footer">
      <p class="footer-text text-secondary">
        读城 v0.2.0
      </p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { CITIES } from '../data/cities/index.js'
import { useGameStore } from '../stores/game.js'
import BadgeDisplay from '../components/BadgeDisplay.vue'

const router = useRouter()

function getGameStore(cityId) {
  try {
    return useGameStore(cityId)
  } catch {
    return null
  }
}

function isCityStarted(cityId) {
  const game = getGameStore(cityId)
  return game?.isStarted ?? false
}

function isCityCompleted(cityId) {
  const game = getGameStore(cityId)
  return game?.isFinished ?? false
}

function enterCity(city) {
  if (!city.available) return
  router.push(`/city/${city.id}`)
}
</script>

<style scoped>
.platform-home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
}

.platform-header {
  text-align: center;
  padding: var(--spacing-xl) 0 var(--spacing-md);
}

.platform-title {
  font-family: var(--font-handwriting);
  font-size: 2.8rem;
  font-weight: 400;
  color: #e8e0d4;
  letter-spacing: 0.3em;
  margin-bottom: var(--spacing-sm);
}

.platform-subtitle {
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  line-height: 1.8;
  color: #8a7e6e;
}

.city-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  flex: 1;
}

.city-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: #2c2c2c;
  border-color: #3a3a3a;
  position: relative;
  overflow: hidden;
}

.city-card--available:active {
  transform: scale(0.98);
}

.city-card--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.card-body {
  margin-bottom: var(--spacing-md);
}

.card-city-name {
  font-size: 1.6rem;
  font-weight: 700;
  color: #e8e0d4;
  margin-bottom: var(--spacing-xs);
  letter-spacing: 0.1em;
}

.card-script-name {
  font-family: var(--font-handwriting);
  font-size: 1.1rem;
  color: #c4b59a;
  margin-bottom: var(--spacing-sm);
}

.card-tagline {
  font-size: 0.85rem;
  line-height: 1.6;
  color: #8a7e6e;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.card-status {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.card-status--coming { color: #5a5a5a; }
.card-status--done { color: #4a7c59; }
.card-status--progress { color: #c9a96e; }
.card-status--new { color: #8a7e6e; }

.city-accent--shanghai { border-left: 4px solid #c9a96e; }
.city-accent--nanjing { border-left: 4px solid #8b1a1a; }
.city-accent--hangzhou { border-left: 4px solid #7a9e7e; }
.city-accent--xian { border-left: 4px solid #d4a020; }
.city-accent--suzhou { border-left: 4px solid #4a6fa5; }

.platform-footer {
  text-align: center;
  padding: var(--spacing-xl) 0 var(--spacing-md);
}

.footer-text {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: #5a5a5a;
}
</style>
