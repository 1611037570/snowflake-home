<template>
  <Title :name="$t('image.formatAdjust')" />
  <div class="flex items-center">
    <span class="text-sm font-medium">{{ $t('image.formatAdjust') }}</span>
  </div>
  <ElSelect v-model="modelValue" :placeholder="$t('image.formatSelectPlaceholder')" class="w-full">
    <ElOption v-for="opt in formats" :key="opt" :label="opt" :value="opt" />
  </ElSelect>
</template>

<script setup>
import Title from './title.vue'
// 定义组件属性：原始格式（用于切换时恢复默认值）
defineProps({
  originalFormat: { type: String, default: '' },
})

// 使用 defineModel 创建双向绑定的格式值
const modelValue = defineModel('modelValue')

// 支持的图片格式列表
const formats = ['jpg', 'png', 'webp']
</script>
