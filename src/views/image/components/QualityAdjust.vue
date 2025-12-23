<template>
  <div class="flex items-center">
    <span class="text-sm font-medium">{{ $t('image.qualityAdjust') }}</span>
    <SfIcon
      icon="material-symbols:restart-alt"
      size="5"
      class="hover:text-sf-theme"
      @click.stop="resetToOriginal"
    />
  </div>
  <ElSelect v-model="modelValue" :placeholder="$t('image.qualitySelectPlaceholder')" class="w-full">
    <ElOption
      v-for="opt in qualityOptions"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
    />
  </ElSelect>
</template>

<script setup>
// 定义组件属性：默认质量值（当禁用质量调整时使用）
const props = defineProps({ defaultQuality: { type: Number, default: 1 } })

// 使用 defineModel 创建双向绑定的质量值
const modelValue = defineModel('modelValue', { default: 1 })

// 重置到默认质量值
const resetToOriginal = () => {
  modelValue.value = props.defaultQuality
}

// 质量选项配置
const qualityOptions = [
  { label: $t('image.quality.lossless'), value: 1 },
  { label: $t('image.quality.high'), value: 0.8 },
  { label: $t('image.quality.medium'), value: 0.6 },
  { label: $t('image.quality.low'), value: 0.4 },
  { label: $t('image.quality.veryLow'), value: 0.2 },
]
</script>
