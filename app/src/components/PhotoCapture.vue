<template>
  <div class="photo-capture">
    <div class="photo-prompt cipher-card">
      <p class="prompt-label">📋 情报存档指令</p>
      <p class="prompt-text">{{ prompt }}</p>
    </div>

    <template v-if="!previewUrl">
      <label class="btn-primary photo-btn" style="cursor: pointer">
        <span>拍摄存档</span>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          capture="environment"
          style="display: none"
          @change="handleCapture"
        />
      </label>
      <button class="btn-skip" @click="emit('done')">跳过存档</button>
    </template>

    <template v-else>
      <div class="preview-container animate-fade-in">
        <img :src="previewUrl" alt="存档照片" class="preview-image" />
        <div class="preview-stamp">
          <span class="stamp stamp--success">已存档</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { savePhoto } from '../utils/photo-store.js'
import { useGameStore } from '../stores/game.js'

const props = defineProps({
  stageId: {
    type: Number,
    required: true
  },
  prompt: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['done'])

const game = useGameStore()
const fileInput = ref(null)
const previewUrl = ref(null)

async function handleCapture(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // Show preview immediately
  previewUrl.value = URL.createObjectURL(file)

  // Save to IndexedDB
  try {
    await savePhoto(props.stageId, file)
    game.recordPhoto(props.stageId)
  } catch (err) {
    console.error('Failed to save photo:', err)
  }

  setTimeout(() => {
    emit('done')
  }, 1500)
}
</script>

<style scoped>
.photo-capture {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.photo-prompt {
  padding: var(--spacing-md);
}

.prompt-label {
  font-size: 0.8rem;
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 0.08em;
  margin-bottom: var(--spacing-xs);
}

.prompt-text {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.photo-btn {
  width: 100%;
  padding: 14px;
  font-size: 1rem;
  text-align: center;
  justify-content: center;
}

.preview-container {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.preview-image {
  width: 100%;
  display: block;
  border-radius: var(--radius-md);
  max-height: 300px;
  object-fit: cover;
}

.btn-skip {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  text-align: center;
  cursor: pointer;
  padding: var(--spacing-xs) 0;
  opacity: 0.6;
  text-decoration: underline;
  letter-spacing: 0.04em;
}

.btn-skip:hover {
  opacity: 1;
}

.preview-stamp {
  position: absolute;
  bottom: var(--spacing-md);
  right: var(--spacing-md);
  animation: stamp-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
</style>
