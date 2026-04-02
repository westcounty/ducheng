<template>
  <div class="answer-input">
    <!-- Confirm type: just a button -->
    <template v-if="type === 'confirm'">
      <button class="btn-primary" style="width: 100%" @click="handleConfirm">
        确认
      </button>
    </template>

    <!-- Text / Number type -->
    <template v-else>
      <div class="input-row">
        <input
          v-model="inputValue"
          :type="type === 'number' ? 'number' : 'text'"
          :placeholder="placeholder || '请输入答案'"
          class="input-answer"
          :class="{
            'input-answer--error': feedback === 'wrong',
            'input-answer--success': feedback === 'correct'
          }"
          :disabled="feedback === 'correct'"
          @keyup.enter="verify"
        />
        <button
          class="btn-primary verify-btn"
          :disabled="!inputValue || feedback === 'correct'"
          @click="verify"
        >
          验证
        </button>
      </div>

      <transition name="feedback-fade">
        <p v-if="feedback === 'correct'" class="feedback feedback--correct">
          ✓ 正确
        </p>
        <p v-else-if="feedback === 'wrong'" class="feedback feedback--wrong">
          答案不对，再想想。
        </p>
      </transition>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { checkAnswer } from '../utils/cipher.js'

const props = defineProps({
  answer: {
    type: [String, Number],
    required: true
  },
  type: {
    type: String,
    default: 'text',
    validator: (v) => ['text', 'number', 'confirm'].includes(v)
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['correct'])

const inputValue = ref('')
const feedback = ref(null) // null | 'correct' | 'wrong'

function verify() {
  if (!inputValue.value) return
  const isCorrect = checkAnswer(String(inputValue.value), String(props.answer))
  if (isCorrect) {
    feedback.value = 'correct'
    setTimeout(() => {
      emit('correct')
    }, 800)
  } else {
    feedback.value = 'wrong'
    setTimeout(() => {
      if (feedback.value === 'wrong') feedback.value = null
    }, 2000)
  }
}

function handleConfirm() {
  emit('correct')
}
</script>

<style scoped>
.answer-input {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.input-row {
  display: flex;
  gap: var(--spacing-sm);
  align-items: stretch;
}

.input-row .input-answer {
  flex: 1;
  min-width: 0;
}

.verify-btn {
  flex-shrink: 0;
  padding: 12px var(--spacing-md);
  white-space: nowrap;
}

.feedback {
  font-size: 0.9rem;
  font-weight: 500;
  padding: var(--spacing-xs) 0;
}

.feedback--correct {
  color: var(--success);
}

.feedback--wrong {
  color: var(--error);
}

.feedback-fade-enter-active,
.feedback-fade-leave-active {
  transition: opacity 0.3s ease;
}

.feedback-fade-enter-from,
.feedback-fade-leave-to {
  opacity: 0;
}
</style>
