<template>
  <div class="quiz-input">
    <div class="quiz-options">
      <div
        v-for="(option, i) in options"
        :key="i"
        class="quiz-option"
        :class="{
          'quiz-option--selected': selectedIndex === i && !verifyResult,
          'quiz-option--correct': verifyResult?.approved && selectedIndex === i,
          'quiz-option--wrong': verifyResult && !verifyResult.approved && selectedIndex === i,
        }"
        @click="selectOption(i)"
      >
        <span class="quiz-option__marker">{{ MARKERS[i] }}</span>
        <span class="quiz-option__text">{{ option }}</span>
      </div>
    </div>

    <div v-if="submitting" class="loading-spinner" style="padding: 12px">
      <div class="loading-spinner__ring"></div>
    </div>

    <div v-if="verifyResult" class="submit-feedback" :class="feedbackClass">
      <p class="submit-feedback__title">{{ verifyResult.approved ? '回答正确' : '回答有误' }}</p>
      <p v-if="verifyResult.reason" class="submit-feedback__text">{{ verifyResult.reason }}</p>
    </div>

    <button
      v-if="selectedIndex !== null && !verifyResult && !submitting"
      class="cta-btn cta-btn--primary"
      @click="handleSubmit"
    >
      确认选择
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useExploreStore } from '../stores/explore.js'

const MARKERS = ['A', 'B', 'C', 'D']

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['submitted'])

const store = useExploreStore()

const selectedIndex = ref(null)
const submitting = ref(false)
const verifyResult = ref(null)

const feedbackClass = computed(() =>
  verifyResult.value?.approved ? 'submit-feedback--success' : 'submit-feedback--fail'
)

function selectOption(index) {
  if (verifyResult.value) return
  selectedIndex.value = index
}

async function handleSubmit() {
  if (selectedIndex.value === null || submitting.value) return

  submitting.value = true
  verifyResult.value = null

  try {
    const result = await store.doSubmit(props.slug, {
      selectedIndex: selectedIndex.value,
    })

    verifyResult.value = {
      approved: result.approved,
      reason: result.approved ? '' : '不是这个，再看看',
    }

    if (result.approved) {
      setTimeout(() => {
        emit('submitted', result)
      }, 1200)
    } else {
      setTimeout(() => {
        verifyResult.value = null
        selectedIndex.value = null
      }, 2500)
    }
  } catch (err) {
    verifyResult.value = { approved: false, reason: err.message }
  } finally {
    submitting.value = false
  }
}
</script>
