<template>
  <div class="badge-collection">
    <h3 class="badge-title">{{ title || '城市徽章' }}</h3>
    <div class="badge-row">
      <div
        v-for="city in cityBadges"
        :key="city.id"
        class="badge-item"
        :class="{ 'badge-item--unlocked': city.unlocked, 'badge-item--locked': !city.unlocked }"
      >
        <div
          class="badge-icon"
          :style="city.unlocked ? { borderColor: city.color, color: city.color } : {}"
        >
          <span v-if="city.unlocked">{{ city.icon }}</span>
          <span v-else class="badge-lock">?</span>
        </div>
        <div class="badge-label">{{ city.unlocked ? city.name : '未解锁' }}</div>
      </div>
      <!-- Ultimate badge -->
      <div
        v-if="showUltimate"
        class="badge-item"
        :class="{ 'badge-item--unlocked': allUnlocked, 'badge-item--ultimate': allUnlocked }"
      >
        <div
          class="badge-icon badge-icon--ultimate"
          :style="allUnlocked ? { borderColor: '#c4a35a', color: '#c4a35a' } : {}"
        >
          <span v-if="allUnlocked">读</span>
          <span v-else class="badge-lock">?</span>
        </div>
        <div class="badge-label">{{ allUnlocked ? '读城人' : '???' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlatformStore, BADGE_DEFINITIONS } from '../stores/platform.js'

defineProps({
  title: { type: String, default: '' },
  showUltimate: { type: Boolean, default: true }
})

const platform = usePlatformStore()

const cityBadges = computed(() =>
  Object.entries(BADGE_DEFINITIONS).map(([id, def]) => ({
    id,
    ...def,
    unlocked: platform.isBadgeUnlocked(id)
  }))
)

const allUnlocked = computed(() => platform.allBadgesUnlocked)
</script>

<style scoped>
.badge-collection {
  padding: var(--spacing-md) 0;
}

.badge-title {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: var(--spacing-md);
  letter-spacing: 0.1em;
}

.badge-row {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  transition: transform 0.2s ease;
}

.badge-item--unlocked:hover {
  transform: scale(1.08);
}

.badge-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-family: var(--font-display);
  font-weight: 700;
  background: var(--bg-secondary);
  transition: all 0.3s ease;
}

.badge-item--unlocked .badge-icon {
  border-width: 2.5px;
  box-shadow: 0 0 8px rgba(196, 163, 90, 0.2);
}

.badge-item--ultimate .badge-icon {
  width: 56px;
  height: 56px;
  font-size: 1.4rem;
  box-shadow: 0 0 16px rgba(196, 163, 90, 0.35);
}

.badge-lock {
  color: var(--border);
  font-family: var(--font-body);
  font-size: 1rem;
}

.badge-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-family: var(--font-body);
  letter-spacing: 0.05em;
}

.badge-item--unlocked .badge-label {
  color: var(--text-primary);
}

.badge-item--locked {
  opacity: 0.5;
}
</style>
