<template>
  <div class="w-full max-w-4xl">
    <div
      class="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-lg"
    >
      <!-- 头部区域 -->
      <div class="border-b border-white/10 bg-gradient-to-r from-blue-800/30 to-purple-800/30 p-6">
        <h1 class="text-center text-3xl font-bold text-white">冒泡排序可视化</h1>
        <p class="mt-2 text-center text-blue-100">可视化展示冒泡排序算法的工作原理</p>
      </div>

      <!-- 控制和统计区域 -->
      <div class="border-b border-white/10 p-6">
        <BubbleControls :status="combinedStatus" :actions="controlActions" />
        <BubbleStats :stats="statsList" />
      </div>

      <!-- 可视化区域 -->
      <BubbleVisualizer :data="data" :state="state" :status="combinedStatus" />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import BubbleControls from './BubbleControls.vue'
import BubbleStats from './BubbleStats.vue'
import BubbleVisualizer from './BubbleVisualizer.vue'
import { useBubbleSort } from './useBubbleSort'
import { useSortControl } from './useSortControl'

// 1. 初始化算法核心 (Model)
const { data, status: coreStatus, state, counters, actions: coreActions } = useBubbleSort()

// 2. 初始化控制器 (Controller)
const { status: controlStatus, actions: controlActions } = useSortControl({
  executeSingleStep: coreActions.executeSingleStep,
  resetAlgorithm: coreActions.reset,
  isCompleted: computed(() => coreStatus.isCompleted),
  isAnimating: computed(() => coreStatus.isAnimating),
})

// 3. 组装视图状态 (View Model)
const combinedStatus = reactive({
  isCompleted: computed(() => coreStatus.isCompleted),
  isAnimating: computed(() => coreStatus.isAnimating),
  statusText: controlStatus.statusText,
})

const statsList = computed(() => [
  { label: '当前状态', value: controlStatus.statusText.value },
  { label: '比较次数', value: counters.comparisonCount },
  { label: '交换次数', value: counters.swapCount },
  { label: '当前轮次', value: `${state.currentRound}/${data.value.length - 1}` },
])
</script>
