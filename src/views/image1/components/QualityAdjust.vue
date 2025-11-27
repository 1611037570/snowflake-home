<template>
  <div
    class="flex flex-col rounded-lg bg-sf-primary-hover/50 px-3 py-2 transition-colors duration-200 hover:bg-sf-primary-hover hover:shadow-sm"
  >
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">调整质量</span>
      <ElSwitch v-model="enabled" />
    </div>
    <ElSelect v-if="enabled" v-model="quality" placeholder="选择质量" class="w-full">
      <ElOption
        v-for="opt in qualityOptions"
        :key="opt.value"
        :label="opt.label"
        :value="opt.value"
      />
    </ElSelect>
  </div>
</template>

<script setup>
const modelValue = defineModel('modelValue', { default: 1 })
const enabled = ref(false)
const qualityOptions = [
  { label: '无损', value: 1 },
  { label: '高质量', value: 0.8 },
  { label: '中质量', value: 0.6 },
  { label: '低质量', value: 0.4 },
  { label: '超低质量', value: 0.2 },
]
const quality = ref(1)
watch(enabled, (on) => {
  if (on) {
    quality.value = 1
    modelValue.value = quality.value
  } else {
    modelValue.value = null
  }
})
watch(quality, (v) => {
  if (enabled.value) modelValue.value = v
})
</script>
