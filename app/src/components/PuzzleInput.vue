<template>
  <div class="puzzle-input">
    <div class="puzzle-input__row">
      <input
        v-model="answer"
        type="text"
        class="puzzle-input__field"
        placeholder="请输入答案"
        :disabled="!!verifyResult?.approved"
        @keyup.enter="handleSubmit"
      />
      <button
        class="puzzle-input__submit"
        :disabled="!answer.trim() || submitting || !!verifyResult?.approved"
        @click="handleSubmit"
      >
        {{ submitting ? '...' : '提交' }}
      </button>
    </div>

    <div v-if="submitting" class="loading-spinner" style="padding: 12px">
      <div class="loading-spinner__ring"></div>
    </div>

    <div v-if="verifyResult" class="submit-feedback" :class="feedbackClass">
      <p class="submit-feedback__title">{{ verifyResult.approved ? '回答正确' : '回答有误' }}</p>
      <p v-if="verifyResult.reason" class="submit-feedback__text">{{ verifyResult.reason }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useExploreStore } from '../stores/explore.js'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['submitted'])

const store = useExploreStore()

const answer = ref('')
const submitting = ref(false)
const verifyResult = ref(null)

const feedbackClass = computed(() =>
  verifyResult.value?.approved ? 'submit-feedback--success' : 'submit-feedback--fail'
)

async function handleSubmit() {
  if (!answer.value.trim() || submitting.value) return

  submitting.value = true
  verifyResult.value = null

  try {
    const result = await store.doSubmit(props.slug, {
      answerText: answer.value.trim(),
    })

    verifyResult.value = {
      approved: result.approved,
      reason: result.approved ? '' : '再想想，答案不太对',
    }

    if (result.approved) {
      setTimeout(() => {
        emit('submitted', result)
      }, 1200)
    } else {
      // Clear for retry after delay
      setTimeout(() => {
        verifyResult.value = null
      }, 2500)
    }
  } catch (err) {
    verifyResult.value = { approved: false, reason: err.message }
  } finally {
    submitting.value = false
  }
}
</script>
