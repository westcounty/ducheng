<template>
  <div class="transit page-padding">
    <template v-if="!fromStage || !toStage">
      <p class="text-secondary">载入中…</p>
    </template>

    <template v-else>
      <!-- Route display -->
      <header class="transit-header">
        <div class="route-display">
          <div class="route-from">
            <span class="route-label text-secondary">出发</span>
            <span class="route-name">{{ fromStage.title }}</span>
          </div>
          <div class="route-arrow text-accent">→</div>
          <div class="route-to">
            <span class="route-label text-secondary">目的地</span>
            <span class="route-name">{{ toStage.title }}</span>
          </div>
        </div>
      </header>

      <hr class="divider" />

      <!-- Transit info -->
      <div class="transit-info">
        <template v-if="fromStage.transition?.metro">
          <div class="metro-card cipher-card">
            <p class="info-label text-accent">地铁路线</p>
            <p class="metro-route">
              🚇 {{ fromStage.transition.metro.line }} 号线
            </p>
            <p class="metro-detail text-secondary">
              {{ fromStage.transition.metro.from }} →
              {{ fromStage.transition.metro.to }}
              · {{ fromStage.transition.metro.stops }} 站
            </p>
          </div>
        </template>

        <template v-else-if="fromStage.transition?.hint">
          <div class="walk-card cipher-card">
            <p class="info-label text-accent">步行指引</p>
            <p class="walk-detail">{{ fromStage.transition.hint }}</p>
          </div>
        </template>
      </div>

      <!-- Diary quote from next stage -->
      <div class="diary-preview animate-fade-in">
        <p class="diary-label text-secondary">鹤影日记残页</p>
        <blockquote class="diary-quote cipher-card cipher-card--accent text-handwriting">
          {{ toStage.diaryQuote }}
        </blockquote>
      </div>

      <!-- Action -->
      <div class="action-area">
        <button class="btn-primary action-btn" @click="arrived">
          我到了
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { useCityData } from '../data/cities/useCityData.js'

const props = defineProps({
  cityId: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true }
})

const router = useRouter()
const game = useGameStore(props.cityId)
const { cityData } = useCityData(computed(() => props.cityId))

const fromStage = computed(() => cityData.value?.getStage(Number(props.from)))
const toStage = computed(() => cityData.value?.getStage(Number(props.to)))

function arrived() {
  game.goToNextStage()
  router.push(`/city/${props.cityId}/stage/${props.to}`)
}
</script>

<style scoped>
.transit {
  min-height: 100vh;
}

.transit-header {
  padding: var(--spacing-lg) 0 var(--spacing-md);
}

.route-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.route-from,
.route-to {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.route-to {
  text-align: right;
}

.route-label {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.route-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.route-arrow {
  font-size: 1.5rem;
  font-weight: 300;
  flex-shrink: 0;
}

.transit-info {
  margin: var(--spacing-lg) 0;
}

.info-label {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.metro-route {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.metro-detail {
  font-size: 0.9rem;
}

.walk-detail {
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
}

.diary-preview {
  margin: var(--spacing-lg) 0;
}

.diary-label {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: var(--spacing-sm);
}

.diary-quote {
  font-size: 1rem;
  line-height: 1.9;
  color: var(--text-primary);
  border-left: 3px solid var(--accent);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  quotes: none;
  margin: 0;
}

.action-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl) 0;
}

.action-btn {
  width: 100%;
  max-width: 280px;
  padding: 14px;
  font-size: 1rem;
  letter-spacing: 0.15em;
}
</style>
