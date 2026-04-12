<template>
  <div class="task-card" @click="$emit('click')">
    <img
      v-if="task.coverImage"
      :src="task.coverImage"
      :alt="task.title"
      class="task-card__cover"
      loading="lazy"
    />
    <div v-else class="task-card__cover-placeholder">
      <span>&#x1F9ED;</span>
    </div>
    <div class="task-card__overlay"></div>

    <div class="task-card__body">
      <h3 class="task-card__title">{{ task.title }}</h3>
      <div class="task-card__meta">
        <span
          v-if="task.difficulty"
          class="task-card__difficulty"
          :class="`task-card__difficulty--${task.difficulty}`"
        >
          {{ difficultyLabel }}
        </span>
        <span v-if="task.locationSummary" class="task-card__meta-item">
          &#x1F4CD; {{ task.locationSummary }}
        </span>
        <span v-if="task.estimatedMinutes" class="task-card__meta-item">
          &#x23F1; {{ task.estimatedMinutes }}min
        </span>
      </div>
      <div v-if="task.completionCount > 0" class="task-card__completions">
        {{ task.completionCount }} 人已完成
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

defineEmits(['click'])

const DIFFICULTY_MAP = { easy: '轻松', medium: '适中', hard: '挑战' }

const difficultyLabel = computed(() =>
  DIFFICULTY_MAP[props.task.difficulty] || props.task.difficulty
)
</script>
