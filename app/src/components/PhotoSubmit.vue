<template>
  <div class="photo-submit">
    <!-- Preview uploaded photo -->
    <div v-if="previewUrl" class="photo-submit__preview animate-fade-in">
      <img :src="previewUrl" alt="提交的照片" />
    </div>

    <!-- Camera button -->
    <label v-else class="photo-submit__camera-btn">
      <span class="photo-submit__camera-icon">&#x1F4F7;</span>
      <span class="photo-submit__camera-text">拍摄或选择照片</span>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        style="display: none"
        @change="handleFile"
      />
    </label>

    <!-- Upload progress / AI verification -->
    <div v-if="uploading" class="loading-spinner">
      <div class="loading-spinner__ring"></div>
    </div>

    <div v-if="verifyResult" class="submit-feedback" :class="feedbackClass">
      <p class="submit-feedback__title">{{ verifyResult.approved ? '验证通过' : '验证未通过' }}</p>
      <p class="submit-feedback__text">{{ verifyResult.reason || '' }}</p>
    </div>

    <!-- Submit button (shown after photo selected and uploaded) -->
    <button
      v-if="uploadedUrl && !verifyResult"
      class="cta-btn cta-btn--primary"
      :disabled="uploading"
      @click="handleSubmit"
    >
      提交照片
    </button>
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

const fileInput = ref(null)
const previewUrl = ref(null)
const uploadedUrl = ref(null)
const uploading = ref(false)
const verifyResult = ref(null)

const feedbackClass = computed(() =>
  verifyResult.value?.approved ? 'submit-feedback--success' : 'submit-feedback--fail'
)

async function handleFile(event) {
  const file = event.target.files?.[0]
  if (!file) return

  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true

  try {
    const result = await store.doUploadPhoto(file)
    uploadedUrl.value = result.url
  } catch (err) {
    console.error('Upload failed:', err)
    previewUrl.value = null
  } finally {
    uploading.value = false
  }
}

async function handleSubmit() {
  if (!uploadedUrl.value) return
  uploading.value = true

  try {
    const result = await store.doSubmit(props.slug, {
      photoUrl: uploadedUrl.value,
    })
    verifyResult.value = {
      approved: result.approved,
      reason: result.aiResult?.reason || '',
    }

    if (result.approved) {
      setTimeout(() => {
        emit('submitted', result)
      }, 1500)
    }
  } catch (err) {
    verifyResult.value = { approved: false, reason: err.message }
  } finally {
    uploading.value = false
  }
}
</script>
