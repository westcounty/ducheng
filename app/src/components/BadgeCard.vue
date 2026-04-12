<template>
  <div class="badge-card" :class="badge.unlocked ? 'badge-card--unlocked' : 'badge-card--locked'">
    <div
      class="badge-card__icon"
      :style="badge.unlocked ? {
        background: `${badge.badgeColor}22`,
        color: badge.badgeColor,
        border: `2px solid ${badge.badgeColor}`,
      } : {}"
    >
      <template v-if="badge.unlocked">{{ badge.badgeIcon }}</template>
      <template v-else>&#x1F512;</template>
    </div>
    <div class="badge-card__name">
      {{ badge.unlocked ? badge.badgeName : '未解锁' }}
    </div>
    <div class="badge-card__task">
      {{ badge.taskTitle || '' }}
    </div>
    <div v-if="badge.unlocked && badge.unlockedAt" class="badge-card__date">
      {{ formatDate(badge.unlockedAt) }}
    </div>
    <div v-if="!badge.unlocked" class="badge-card__date">
      完成任务即可解锁
    </div>
  </div>
</template>

<script setup>
defineProps({
  badge: {
    type: Object,
    required: true,
  },
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}
</script>
