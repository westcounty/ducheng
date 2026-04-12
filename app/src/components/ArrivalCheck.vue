<template>
  <div class="arrival-check">
    <div class="arrival-check__target">
      <p class="arrival-check__target-name">{{ locationName }}</p>
      <p v-if="locationAddress" class="arrival-check__target-addr">{{ locationAddress }}</p>
    </div>

    <div v-if="distance !== null" class="arrival-check__distance">
      &#x1F4CD; 距目标 {{ formatDistance(distance) }}
    </div>

    <!-- GPS verification feedback -->
    <div v-if="verifyResult" class="submit-feedback" :class="feedbackClass">
      <p class="submit-feedback__title">{{ verifyResult.approved ? '已确认到达' : '距离太远' }}</p>
      <p class="submit-feedback__text">{{ verifyResult.reason || '' }}</p>
    </div>

    <div v-if="gpsError" class="submit-feedback submit-feedback--fail">
      <p class="submit-feedback__title">定位失败</p>
      <p class="submit-feedback__text">{{ gpsError }}</p>
    </div>

    <div v-if="checking" class="loading-spinner">
      <div class="loading-spinner__ring"></div>
    </div>

    <button
      v-if="!verifyResult || !verifyResult.approved"
      class="cta-btn cta-btn--primary"
      :disabled="checking"
      @click="checkArrival"
    >
      {{ checking ? '定位中...' : '我已到达' }}
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
  locationName: {
    type: String,
    required: true,
  },
  locationAddress: {
    type: String,
    default: '',
  },
  targetLat: {
    type: Number,
    default: null,
  },
  targetLng: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['submitted'])

const store = useExploreStore()

const checking = ref(false)
const distance = ref(null)
const gpsError = ref(null)
const verifyResult = ref(null)

const feedbackClass = computed(() =>
  verifyResult.value?.approved ? 'submit-feedback--success' : 'submit-feedback--fail'
)

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

function getGeoPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        const messages = {
          1: '请允许定位权限',
          2: '无法获取位置',
          3: '定位超时，请重试',
        }
        reject(new Error(messages[err.code] || '定位失败'))
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  })
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000 // Earth radius in meters
  const toRad = (v) => (v * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function checkArrival() {
  checking.value = true
  gpsError.value = null
  verifyResult.value = null

  try {
    const pos = await getGeoPosition()

    // Calculate distance if target coordinates available
    if (props.targetLat && props.targetLng) {
      distance.value = haversineDistance(pos.lat, pos.lng, props.targetLat, props.targetLng)
    }

    // Submit to backend for verification
    const result = await store.doSubmit(props.slug, {
      gpsLat: pos.lat,
      gpsLng: pos.lng,
    })

    verifyResult.value = {
      approved: result.approved,
      reason: result.approved ? '' : '请更靠近目标位置后重试',
    }

    if (result.approved) {
      setTimeout(() => {
        emit('submitted', result)
      }, 1500)
    }
  } catch (err) {
    if (err.name === 'ApiError') {
      verifyResult.value = { approved: false, reason: err.message }
    } else {
      gpsError.value = err.message
    }
  } finally {
    checking.value = false
  }
}
</script>
