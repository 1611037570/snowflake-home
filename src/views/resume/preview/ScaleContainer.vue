<script setup>
import { TransitionPresets, useDebounceFn, useResizeObserver, useTransition } from '@vueuse/core'
import { computed, ref } from 'vue'

defineOptions({ name: 'ScaleContainer' })

const containerRef = ref(null)
const autoScale = ref(1)
const manualScale = ref(1)
const maxScale = ref(1)
const scaleMode = ref('auto')
const isOpen = ref(false)

const TARGET_WIDTH = 794
const PADDING = 40
const MIN_SCALE = 0.5
const SCALE_LIST = [0.5, 0.7, 0.9, 1]

const scale = computed(() => (scaleMode.value === 'auto' ? autoScale.value : manualScale.value))
const transitionScale = useTransition(scale, {
  duration: 200,
  transition: TransitionPresets.easeOutCubic,
})
const scaleText = computed(() => `${Math.round(transitionScale.value * 100)}%`)
const scaleLabel = computed(() => (scaleMode.value === 'auto' ? '适合屏幕' : scaleText.value))
const minScale = computed(() => Math.min(MIN_SCALE, maxScale.value))
const isMinScale = computed(() => scale.value <= minScale.value)
const isMaxScale = computed(() => scale.value >= maxScale.value)

const isManualScaleSelected = (value) => {
  return (
    scaleMode.value === 'manual' && Math.round(manualScale.value * 100) === Math.round(value * 100)
  )
}

const clampScale = (value) => {
  return Math.min(Math.max(value, minScale.value), maxScale.value)
}

const setManualScale = (value) => {
  scaleMode.value = 'manual'
  manualScale.value = clampScale(value)
  isOpen.value = false
}

const setAutoScale = () => {
  scaleMode.value = 'auto'
  isOpen.value = false
}

const decreaseScale = () => {
  setManualScale(Math.max(MIN_SCALE, Number((scale.value - 0.1).toFixed(1))))
}

const increaseScale = () => {
  setManualScale(Math.min(maxScale.value, Number((scale.value + 0.1).toFixed(1))))
}

const updateScale = useDebounceFn(([entry]) => {
  const { width, height } = entry.contentRect

  // 确保宽度和高度有效
  if (width <= 0 || height <= 0) return

  // 防止除以0或负数
  if (width <= PADDING || height <= PADDING) {
    autoScale.value = 0.1
    maxScale.value = 0.1
    return
  }

  // 只根据宽度计算缩放比例，让内容在垂直方向可以滚动
  // 取缩放比例，且最大不超过 1
  maxScale.value = (width - PADDING) / TARGET_WIDTH
  autoScale.value = maxScale.value
  manualScale.value = clampScale(manualScale.value)
}, 100)

useResizeObserver(() => containerRef.value?.wrapRef, updateScale)
</script>

<template>
  <div class="relative h-full w-full">
    <!-- 测量容器：relative + overflow-y-auto 允许垂直滚动 -->
    <SfScrollbar
      ref="containerRef"
      class="relative h-full w-full"
      height="100%"
      view-class="relative min-h-full w-full"
    >
      <!-- 展示容器：absolute + flex 居中 -->
      <div
        class="absolute inset-x-0 top-0 flex flex-col items-center"
        :style="{
          zoom: scale,
        }"
      >
        <slot></slot>
      </div>
    </SfScrollbar>

    <div
      class="absolute right-4 bottom-4 z-10 overflow-hidden rounded-lg bg-white text-sm text-[#333] shadow-xl"
    >
      <div v-if="isOpen">
        <div class="flex flex-col border-b border-[#f0f0f0] px-6 py-2">
          <button
            v-for="item in SCALE_LIST"
            :key="item"
            class="h-10 text-left"
            :class="{
              'font-medium text-sf-theme': isManualScaleSelected(item),
              'cursor-not-allowed text-[#ccc]': item > maxScale,
            }"
            :disabled="item > maxScale"
            @click="setManualScale(item)"
          >
            {{ Math.round(item * 100) }}%
          </button>
        </div>
        <button
          class="h-10 w-full px-6 text-left"
          :class="{
            'font-medium text-sf-theme': scaleMode === 'auto',
          }"
          @click="setAutoScale"
        >
          适合屏幕
        </button>
      </div>
      <div
        class="flex h-8 items-center justify-between bg-white px-3 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]"
      >
        <button
          class="px-1 text-lg leading-none text-[#999] disabled:text-[#ddd]"
          :disabled="isMinScale"
          @click="decreaseScale"
        >
          −
        </button>
        <button class="px-3 font-medium text-sf-theme" @click="isOpen = !isOpen">
          {{ scaleLabel }}
        </button>
        <button
          class="px-1 text-lg leading-none text-[#999] disabled:text-[#ddd]"
          :disabled="isMaxScale"
          @click="increaseScale"
        >
          ＋
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
