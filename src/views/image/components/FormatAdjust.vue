<template>
  <div
    class="flex flex-col rounded-lg bg-sf-primary-hover/50 px-3 py-2 transition-colors duration-200 hover:bg-sf-primary-hover hover:shadow-sm"
  >
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">{{ $t('image.formatAdjust') }}</span>
      <ElSwitch v-model="show" @update:model-value="handleSwitchChange" />
    </div>
    <ElSelect
      v-if="show"
      v-model="modelValue"
      :placeholder="$t('image.formatSelectPlaceholder')"
      class="w-full"
    >
      <ElOption v-for="opt in options" :key="opt" :label="opt" :value="opt" />
    </ElSelect>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
// 定义组件属性：原始格式（用于切换时恢复默认值）
const props = defineProps({
  originalFormat: { type: String, default: '' },
})

// 使用 defineModel 创建双向绑定的格式值
const modelValue = defineModel('modelValue')

// 控制格式转换功能的启用状态
const show = ref(false)
const options = computed(() => formats.filter((f) => f !== props.originalFormat))

// 处理开关状态变化（由 update:modelValue 事件驱动）
const handleSwitchChange = (value) => {
  if (value) {
    const next = options.value[0]
    modelValue.value = next
  } else {
    modelValue.value = props.originalFormat
  }
}
// 支持的图片格式列表
const formats = ['jpg', 'png', 'webp']
</script>
