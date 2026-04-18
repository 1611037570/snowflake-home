<template>
  <div class="relative w-auto">
    <div
      v-if="newValue"
      class="absolute bottom-full left-[6px] z-10 mb-1 flex h-7 w-[200px] items-center gap-x-2"
    >
      <div
        class="flex h-full cursor-pointer items-center rounded border-none bg-[#2e7d32] px-1.5 text-[11px] text-white"
        @click.stop="handleSave"
      >
        保留
      </div>
      <div
        class="flex h-full cursor-pointer items-center rounded border-none bg-[#999] px-1.5 text-[11px] text-white"
        @click.stop="handleCancel"
      >
        放弃
      </div>
    </div>
    <div
      class="w-full"
      :class="newValue ? displayClass + ' cursor-pointer' : ''"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      {{ newValue ? displayValue : value }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// 定义变量
const value = defineModel('value', { default: '' })
const newValue = defineModel('newValue', { default: '' })

// 鼠标悬停状态
const isHovered = ref(false)

// 计算当前显示的值
const displayValue = computed(() => {
  return isHovered.value ? value.value : newValue.value
})

// 计算当前显示的样式类
const displayClass = computed(() => {
  return isHovered.value ? 'text-[#d32f2f] bg-[#fef0f0] ' : 'text-[#2e7d32] bg-[#e8f5e9]'
})

// 保留修改
const handleSave = () => {
  value.value = newValue.value
  newValue.value = ''
}

// 放弃修改
const handleCancel = () => {
  newValue.value = ''
}

// 鼠标进入事件
const handleMouseEnter = () => {
  // 只有当有旧数据时才显示悬停效果
  if (value.value) {
    isHovered.value = true
  }
}

// 鼠标离开事件
const handleMouseLeave = () => {
  // 只有当有旧数据时才重置悬停状态
  if (value.value) {
    isHovered.value = false
  }
}
</script>
