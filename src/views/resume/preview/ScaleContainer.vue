<script setup>
import { useResizeObserver } from '@vueuse/core'
import { ref } from 'vue'

defineOptions({ name: 'ScaleContainer' })

const containerRef = ref(null)
const scale = ref(1)

const TARGET_WIDTH = 794
const PADDING = 40

useResizeObserver(containerRef, (entries) => {
  const entry = entries[0]
  const { width, height } = entry.contentRect

  // 确保宽度和高度有效
  if (width <= 0 || height <= 0) return

  const availableWidth = width - PADDING
  const availableHeight = height - PADDING

  // 防止除以0或负数
  if (availableWidth <= 0 || availableHeight <= 0) {
    scale.value = 0.1 // 设置一个最小缩放比例
    return
  }

  // 只根据宽度计算缩放比例，让内容在垂直方向可以滚动
  const scaleX = availableWidth / TARGET_WIDTH

  // 取缩放比例，且最大不超过 1
  scale.value = Math.min(scaleX, 1)
})
</script>

<template>
  <!-- 测量容器：relative + overflow-y-auto 允许垂直滚动 -->
  <div ref="containerRef" class="relative h-full w-full overflow-y-auto bg-sf-bg">
    <!-- 展示容器：absolute + flex 居中 -->
    <div class="absolute inset-x-0 top-0 flex flex-col items-center py-10">
      <div
        :style="{
          zoom: scale,
        }"
        class="flex-shrink-0 shadow-2xl transition-transform duration-200"
      >
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
