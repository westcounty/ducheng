<template>
  <div class="comment-input">
    <textarea
      v-model="text"
      class="comment-input__field"
      placeholder="说点什么..."
      maxlength="500"
      rows="2"
    ></textarea>
    <div class="comment-input__actions">
      <span class="comment-input__count">{{ text.length }}/500</span>
      <button
        class="cta-btn cta-btn--primary comment-input__submit"
        :disabled="!text.trim() || submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '发送中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])
const text = ref('')

function handleSubmit() {
  if (!text.value.trim()) return
  emit('submit', text.value.trim())
  text.value = ''
}
</script>
