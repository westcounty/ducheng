<template>
  <div class="narrative-text" :class="{ 'text-handwriting': isHandwriting }" @click="skipToEnd">
    <p
      v-for="(line, index) in visibleLines"
      :key="index"
      class="narrative-line animate-fade-in"
      :style="{ animationDelay: '0ms' }"
    >
      <template v-if="line === ''"><br /></template>
      <template v-else>{{ line }}</template>
    </p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  isHandwriting: {
    type: Boolean,
    default: false
  },
  speed: {
    type: Number,
    default: 600
  }
})

const emit = defineEmits(['complete'])

const lines = props.text.split('\n')
const visibleLines = ref([])
let timer = null
let currentIndex = 0

function revealNextLine() {
  if (currentIndex < lines.length) {
    visibleLines.value.push(lines[currentIndex])
    currentIndex++
    if (currentIndex < lines.length) {
      timer = setTimeout(revealNextLine, props.speed)
    } else {
      emit('complete')
    }
  }
}

function skipToEnd() {
  if (currentIndex >= lines.length) return
  if (timer) clearTimeout(timer)
  while (currentIndex < lines.length) {
    visibleLines.value.push(lines[currentIndex])
    currentIndex++
  }
  emit('complete')
}

onMounted(() => {
  timer = setTimeout(revealNextLine, 200)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

watch(
  () => props.text,
  (newText) => {
    if (timer) clearTimeout(timer)
    visibleLines.value = []
    currentIndex = 0
    const newLines = newText.split('\n')
    lines.splice(0, lines.length, ...newLines)
    timer = setTimeout(revealNextLine, 200)
  }
)
</script>

<style scoped>
.narrative-text {
  line-height: 1.8;
  color: var(--text-primary);
}

.narrative-line {
  margin-bottom: var(--spacing-sm);
  opacity: 0;
  animation: fade-in 0.4s ease forwards;
}
</style>
