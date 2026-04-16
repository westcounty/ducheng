<template>
  <div class="comment-list">
    <div v-if="loading" class="loading-spinner">
      <div class="loading-spinner__ring"></div>
    </div>
    <div v-else-if="comments.length === 0" class="comment-empty">暂无评论</div>
    <div v-else>
      <div v-for="c in comments" :key="c.id" class="comment-item">
        <div class="comment-item__header">
          <span class="comment-item__user">{{ c.userId }}</span>
          <span class="comment-item__time">{{ formatTime(c.createdAt) }}</span>
        </div>
        <p class="comment-item__content">{{ c.content }}</p>
      </div>
      <button v-if="hasMore" class="comment-more" @click="$emit('loadMore')">
        加载更多
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  comments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  hasMore: { type: Boolean, default: false },
})

defineEmits(['loadMore'])

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>
