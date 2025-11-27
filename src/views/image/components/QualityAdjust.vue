<template>
  <div
    class="flex flex-col rounded-lg bg-sf-primary-hover/50 px-3 py-2 transition-colors duration-200 hover:bg-sf-primary-hover hover:shadow-sm"
  >
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">{{ $t('image.qualityAdjust') }}</span>
      <ElSwitch v-model="enabled" />
    </div>
    <ElSelect
      v-if="enabled"
      v-model="modelValue"
      :placeholder="$t('image.qualitySelectPlaceholder')"
      class="w-full"
    >
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
// 定义组件属性：默认质量值（当禁用质量调整时使用）
const props = defineProps({ defaultQuality: { type: Number, default: 1 } })

// 使用 defineModel 创建双向绑定的质量值
const modelValue = defineModel('modelValue', { default: 1 })

// 控制质量调整功能的启用状态
const enabled = ref(true)

// 监听启用状态变化，自动设置合适的质量值
watch(enabled, (on) => {
  // 启用时：使用当前值或默认值；禁用时：恢复为默认质量
  modelValue.value = on ? (modelValue.value ?? props.defaultQuality) : props.defaultQuality
})

// 质量选项配置
const qualityOptions = [
  { label: $t('image.quality.lossless'), value: 1 },
  { label: $t('image.quality.high'), value: 0.8 },
  { label: $t('image.quality.medium'), value: 0.6 },
  { label: $t('image.quality.low'), value: 0.4 },
  { label: $t('image.quality.veryLow'), value: 0.2 },
]
</script>
