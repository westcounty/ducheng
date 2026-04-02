<template>
  <div class="hint-system">
    <button
      v-if="currentLevel < hints.length"
      class="btn-secondary hint-trigger"
      @click="revealHint"
    >
      需要提示？
      <span class="hint-counter">({{ currentLevel }}/{{ hints.length }})</span>
    </button>
    <span v-else class="hint-counter hint-counter--exhausted">
      提示已全部使用 ({{ hints.length }}/{{ hints.length }})
    </span>

    <div v-if="revealedHints.length > 0" class="hints-list">
      <div
        v-for="(hint, index) in revealedHints"
        :key="index"
        class="hint-card animate-fade-in"
      >
        <span class="hint-label">提示 {{ index + 1 }}</span>
        <p class="hint-text">{{ hint }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/game.js'

const props = defineProps({
  hints: {
    type: Array,
    required: true
  },
  stageId: {
    type: [Number, String],
    required: true
  },
  stepId: {
    type: [Number, String],
    required: true
  }
})

const game = useGameStore()

const currentLevel = ref(0)
const revealedHints = ref([])

function revealHint() {
  if (currentLevel.value < props.hints.length) {
    revealedHints.value.push(props.hints[currentLevel.value])
    currentLevel.value++
    game.useHint(Number(props.stageId))
  }
}
</script>

<style scoped>
.hint-system {
  margin-top: var(--spacing-md);
}

.hint-trigger {
  font-size: 0.9rem;
  padding: 8px var(--spacing-md);
}

.hint-counter {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-left: var(--spacing-xs);
}

.hint-counter--exhausted {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.hints-list {
  margin-top: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.hint-card {
  border-left: 3px solid var(--accent);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  opacity: 0;
  animation: fade-in 0.4s ease forwards;
}

.hint-label {
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: block;
  margin-bottom: var(--spacing-xs);
}

.hint-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}
</style>
