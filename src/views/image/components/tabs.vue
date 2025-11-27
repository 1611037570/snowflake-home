<template>
  <div class="mb-3 flex w-full rounded-xl bg-sf-primary-hover/50 p-2">
    <div
      v-for="tab in tabs"
      :key="tab.name"
      class="flex-c h-8 flex-1 cursor-pointer rounded-xl text-sm"
      :class="mode === tab.value ? 'bg-sf-primary shadow' : 'text-sf-secondary hover:bg-sf-primary'"
      @click="mode = tab.value"
    >
      {{ tab.name }}
    </div>
  </div>
  <div class="mb-3 flex w-full flex-col rounded-xl bg-sf-primary-hover/60 p-3">
    <slot />
  </div>
</template>
<script setup>
const mode = defineModel('modelValue')

// 标签配置列表
const tabs = computed(() => {
  const res = [
    { name: $t('image.custom'), value: 'custom' },
    { name: $t('image.presets'), value: 'presets' },
  ]
  return res
})
</script>
