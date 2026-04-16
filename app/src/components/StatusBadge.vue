<template>
  <span class="status-badge" :class="`status-badge--${status}`">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const label = computed(() => ({
  draft: '草稿',
  pending_review: '审核中',
  published: '已发布',
  rejected: '已拒绝',
  archived: '已归档',
}[props.status] || props.status))
</script>
