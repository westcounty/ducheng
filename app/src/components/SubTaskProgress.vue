<template>
  <div class="progress-chain">
    <template v-for="(node, i) in nodes" :key="i">
      <div
        v-if="i > 0"
        class="progress-connector"
        :class="i <= currentIndex ? 'progress-connector--done' : 'progress-connector--pending'"
      ></div>
      <div
        class="progress-node"
        :class="{
          'progress-node--done': node.state === 'done',
          'progress-node--current': node.state === 'current',
          'progress-node--locked': node.state === 'locked',
        }"
      >
        <div class="progress-node__dot">
          <template v-if="node.state === 'done'">&#x2713;</template>
          <template v-else-if="node.state === 'current'">&#x25B8;</template>
          <template v-else>&#x1F512;</template>
        </div>
        <div class="progress-node__label">{{ node.label }}</div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    required: true,
  },
  currentIndex: {
    type: Number,
    required: true,
  },
  labels: {
    type: Array,
    default: () => [],
  },
})

const nodes = computed(() => {
  const result = []
  for (let i = 1; i <= props.total; i++) {
    let state
    if (i < props.currentIndex) {
      state = 'done'
    } else if (i === props.currentIndex) {
      state = 'current'
    } else {
      state = 'locked'
    }
    result.push({
      index: i,
      state,
      label: props.labels[i - 1] || `${i}`,
    })
  }
  return result
})
</script>
