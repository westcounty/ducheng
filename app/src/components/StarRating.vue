<template>
  <div class="star-rating">
    <span
      v-for="n in 5"
      :key="n"
      class="star-rating__star"
      :class="{ filled: n <= modelValue, interactive: interactive }"
      @click="interactive && $emit('update:modelValue', n)"
    >{{ n <= modelValue ? '&#x2605;' : '&#x2606;' }}</span>
    <span v-if="showCount && count > 0" class="star-rating__count">({{ count }})</span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, default: 0 },
  interactive: { type: Boolean, default: false },
  showCount: { type: Boolean, default: false },
  count: { type: Number, default: 0 },
})

defineEmits(['update:modelValue'])
</script>
