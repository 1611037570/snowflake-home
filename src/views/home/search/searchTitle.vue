<script setup>
defineProps({
  title: {
    type: String,
    default: '搜索历史',
  },
  info: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  iconClass: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="mb-2 flex w-full items-center justify-between">
    <div class="flex h-full items-center text-[15px] font-bold text-sf-text">
      <SfIcon v-if="icon" :icon="icon" class="mr-2" :class="iconClass" size="5" />
      <div class="mr-2">
        {{ title }}
      </div>
      <SfTooltip :content="info" v-if="info" />
    </div>
    <div
      class="cursor-pointer text-xs text-blue-500 transition-colors duration-200 hover:text-blue-600"
    >
      <slot name="right" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
