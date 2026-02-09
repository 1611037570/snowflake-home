<script setup>
import { useResizeObserver } from '@vueuse/core'
import { ref } from 'vue'

defineOptions({ name: 'ScaleContainer' })

const containerRef = ref(null)
const scale = ref(1)

const TARGET_WIDTH = 794
const TARGET_HEIGHT = 1123
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

  const scaleX = availableWidth / TARGET_WIDTH
  const scaleY = availableHeight / TARGET_HEIGHT

  // 取较小的缩放比例，且最大不超过 1
  scale.value = Math.min(scaleX, scaleY, 1)
})
</script>

<template>
  <!-- 测量容器：relative + overflow-hidden 确保尺寸仅由父级决定 -->
  <div ref="containerRef" class="relative h-full w-full overflow-hidden bg-sf-bg">
    <!-- 展示容器：absolute + flex 居中，隔离内部布局变化对测量容器的影响 -->
    <div class="absolute inset-0 flex items-center justify-center">
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
