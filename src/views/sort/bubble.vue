<template>
  <div class="w-full max-w-4xl">
    <div
      class="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-lg"
    >
      <div class="border-b border-white/10 bg-gradient-to-r from-blue-800/30 to-purple-800/30 p-6">
        <h1 class="text-center text-3xl font-bold text-white">冒泡排序可视化</h1>
        <p class="mt-2 text-center text-blue-100">可视化展示冒泡排序算法的工作原理</p>
      </div>

      <div class="border-b border-white/10 p-6">
        <div class="mb-4 flex flex-wrap justify-center gap-3">
          <button @click="toggleSorting" :disabled="isCompleted" :class="btnClass">
            <i :class="isSorting && !isPaused ? 'fas fa-pause' : 'fas fa-play'"></i>
            {{ isSorting && !isPaused ? '暂停' : isPaused ? '继续' : '开始' }}
          </button>

          <button
            @click="nextStep"
            :disabled="!isPaused || isCompleted || isAnimating"
            class="flex items-center gap-2 rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-white transition-colors duration-300 hover:bg-yellow-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <i class="fas fa-step-forward"></i>
            下一步
          </button>

          <button
            @click="resetSorting"
            :disabled="isAnimating"
            class="flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-3 font-semibold text-white transition-colors duration-300 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <i class="fas fa-redo"></i>
            重置
          </button>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div
            v-for="(item, key) in stats"
            :key="key"
            class="rounded-lg bg-black/20 p-4 text-center"
          >
            <p class="text-sm text-blue-200">{{ item.label }}</p>
            <p class="text-lg font-bold text-white">{{ item.value }}</p>
          </div>
        </div>
      </div>

      <div class="px-6 pt-4">
        <div class="h-2 overflow-hidden rounded-full bg-black/20">
          <div
            class="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>

      <div
        class="m-6 rounded-lg bg-gradient-to-r from-blue-800/40 to-purple-800/40 p-4 text-center text-xl font-bold text-white transition-all duration-300"
        :class="comparisonClass"
      >
        {{ comparisonText }}
      </div>

      <div class="p-6">
        <div class="flex h-64 items-end justify-center space-x-2 rounded-xl bg-black/20 p-4">
          <div
            v-for="(item, index) in data"
            :key="index"
            class="flex flex-col items-center transition-all duration-1000"
            :class="{
              'scale-105 transform': index === currentIndex || index === currentIndex + 1,
              'z-10': index === currentIndex || index === currentIndex + 1,
            }"
          >
            <div
              class="relative w-12 rounded-t-lg transition-all duration-1000"
              :style="{ height: (item / maxValue) * 200 + 'px' }"
              :class="getBarClass(index)"
            >
              <div
                class="absolute -top-8 left-1/2 -translate-x-1/2 transform text-sm font-bold text-white"
              >
                {{ index === currentIndex || index === currentIndex + 1 ? item : '' }}
              </div>
            </div>
            <div class="mt-2 font-medium text-white">
              {{ item }}
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-white/10 p-6">
        <div class="flex flex-wrap justify-center gap-6">
          <div v-for="(item, index) in legendItems" :key="index" class="flex items-center gap-2">
            <div class="h-5 w-5 rounded" :class="item.color"></div>
            <span class="text-sm text-white">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLocalStorage } from '@vueuse/core'
import { computed, ref } from 'vue'

// 常量定义
const ORIGINAL_DATA = [25, 10, 45, 30, 60, 15, 35, 50]
const DELAY_TIMES = {
  compare: 1000,
  showResult: 1000,
  swap: 1000,
}

// 响应式数据
const data = useLocalStorage('bubble-sort-data', ORIGINAL_DATA)
const isSorting = ref(false)
const isPaused = ref(false)
const isCompleted = ref(false)
const isAnimating = ref(false)
const currentIndex = ref(-1)
const currentRound = ref(0)
const comparisonCount = useLocalStorage('bubble-sort-comparisons', 0)
const swapCount = useLocalStorage('bubble-sort-swaps', 0)
const comparisonText = ref('点击"开始"按钮启动排序动画')
const isComparing = ref(false)
const isSwapping = ref(false)
const swappedInRound = ref(false)

// 计算属性
const maxValue = computed(() => Math.max(...data.value))

const statusText = computed(() => {
  if (isCompleted.value) return '排序完成'
  if (isAnimating.value) return '动画进行中'
  if (isSorting.value && !isPaused.value) return '排序中'
  if (isPaused.value) return '已暂停'
  return '等待开始'
})

const progressPercentage = computed(() => {
  return (currentRound.value / (data.value.length - 1)) * 100
})

const comparisonClass = computed(() => {
  if (isCompleted.value) return 'bg-gradient-to-r from-green-800/40 to-teal-800/40'
  if (isSwapping.value) return 'bg-gradient-to-r from-yellow-800/40 to-orange-800/40'
  if (isComparing.value) return 'bg-gradient-to-r from-red-800/40 to-pink-800/40'
  return 'bg-gradient-to-r from-blue-800/40 to-purple-800/40'
})

const btnClass = computed(() => [
  'flex items-center gap-2 rounded-lg px-5 py-3 font-semibold text-white transition-all duration-300',
  isSorting.value && !isPaused.value
    ? 'bg-red-500 hover:bg-red-600'
    : 'bg-green-500 hover:bg-green-600',
])

const stats = computed(() => [
  { label: '当前状态', value: statusText.value },
  { label: '比较次数', value: comparisonCount.value },
  { label: '交换次数', value: swapCount.value },
  { label: '当前轮次', value: `${currentRound.value}/${data.value.length - 1}` },
])

const legendItems = computed(() => [
  { color: 'bg-gradient-to-b from-blue-500 to-blue-700', label: '正常元素' },
  { color: 'bg-gradient-to-b from-red-500 to-red-700', label: '比较中' },
  { color: 'bg-gradient-to-b from-yellow-500 to-yellow-700', label: '交换中' },
  { color: 'bg-gradient-to-b from-green-500 to-green-700', label: '已排序' },
])

// 工具函数
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getBarClass = (index) => {
  if (isCompleted.value) return 'bg-gradient-to-b from-green-500 to-green-700'
  if (isSwapping.value && (index === currentIndex.value || index === currentIndex.value + 1)) {
    return 'bg-gradient-to-b from-yellow-500 to-yellow-700'
  }
  if (isComparing.value && (index === currentIndex.value || index === currentIndex.value + 1)) {
    return 'bg-gradient-to-b from-red-500 to-red-700'
  }
  if (index >= data.value.length - currentRound.value) {
    return 'bg-gradient-to-b from-green-500 to-green-700'
  }
  return 'bg-gradient-to-b from-blue-500 to-blue-700'
}

// 修复：检查并设置完成状态 - 仅在轮次完成时检查
const checkAndSetCompletion = () => {
  // 只有轮次达到上限才完成
  if (currentRound.value >= data.value.length - 1) {
    isSorting.value = false
    isCompleted.value = true
    comparisonText.value = '排序完成！'
    isAnimating.value = false
    return true
  }
  return false
}

// 修复：处理轮次完成 - 只在需要时重置变量
const handleRoundCompletion = () => {
  // 首先检查是否完成
  if (checkAndSetCompletion()) return true

  // 检查本轮是否有交换
  if (!swappedInRound.value && currentRound.value > 0) {
    // 如果本轮没有交换且不是第0轮，排序完成
    isSorting.value = false
    isCompleted.value = true
    comparisonText.value = '排序完成！'
    isAnimating.value = false
    return true
  }

  // 否则进入下一轮
  currentRound.value++
  currentIndex.value = -1
  swappedInRound.value = false // 重置交换标志

  return false
}

// 修复：检查边界并处理
const checkBoundaryAndHandle = () => {
  // 注意：当前轮次为n时，需要比较到 data.length - n - 1
  if (currentIndex.value >= data.value.length - 1 - currentRound.value) {
    return handleRoundCompletion()
  }
  return false
}

// 修复：核心排序逻辑
const performSortAnimation = async () => {
  isAnimating.value = true

  // 检查是否完成排序
  if (checkAndSetCompletion()) return

  // 检查边界
  if (checkBoundaryAndHandle()) return

  // 清空之前的选中颜色
  isComparing.value = false
  isSwapping.value = false

  // 步骤1：起始坐标++
  currentIndex.value++

  // 再次检查边界
  if (checkBoundaryAndHandle()) return

  const value1 = data.value[currentIndex.value]
  const value2 = data.value[currentIndex.value + 1]

  // 确保value2存在
  if (value2 === undefined) {
    if (handleRoundCompletion()) return
    isAnimating.value = false
    return
  }

  comparisonCount.value++
  isComparing.value = true

  // 步骤1：显示比较
  comparisonText.value = `${value1} ${value1 > value2 ? '>' : '<'} ${value2}`
  await delay(DELAY_TIMES.compare)

  // 步骤2：显示比较结果
  const shouldSwap = value1 > value2
  comparisonText.value = `${value1} ${value1 > value2 ? '>' : '<'} ${value2} = ${shouldSwap ? '交换' : '不交换'}`
  await delay(DELAY_TIMES.showResult)

  if (shouldSwap) {
    // 步骤3：交换元素
    isComparing.value = false
    isSwapping.value = true
    comparisonText.value = `交换: ${value1} ↔ ${value2}`

    // 执行交换
    ;[data.value[currentIndex.value], data.value[currentIndex.value + 1]] = [
      data.value[currentIndex.value + 1],
      data.value[currentIndex.value],
    ]
    swapCount.value++
    swappedInRound.value = true // 标记本轮有交换

    await delay(DELAY_TIMES.swap)
  }

  // 步骤4：该次完成，保留现状
  isComparing.value = false
  isSwapping.value = false
  isAnimating.value = false

  // 步骤5：如果正在排序且未暂停，继续下一步
  if (isSorting.value && !isPaused.value) {
    performSortAnimation()
  }
}

// 开始/暂停排序
const toggleSorting = () => {
  if (isCompleted.value) return

  if (!isSorting.value) {
    // 开始排序，重置所有状态
    isSorting.value = true
    isPaused.value = false
    isCompleted.value = false
    currentIndex.value = -1
    currentRound.value = 0
    swappedInRound.value = false
    performSortAnimation()
  } else if (isPaused.value) {
    // 继续排序
    isPaused.value = false
    performSortAnimation()
  } else {
    // 暂停排序
    isPaused.value = true
  }
}

// 下一步
const nextStep = () => {
  if (isPaused.value && !isCompleted.value && !isAnimating.value) {
    performSortAnimation()
  }
}

// 重置排序
const resetSorting = () => {
  if (isAnimating.value) return

  data.value = [...ORIGINAL_DATA]
  isSorting.value = false
  isPaused.value = false
  isCompleted.value = false
  currentIndex.value = -1
  currentRound.value = 0
  comparisonCount.value = 0
  swapCount.value = 0
  comparisonText.value = '点击"开始"按钮启动排序动画'
  isComparing.value = false
  isSwapping.value = false
  swappedInRound.value = false
}
</script>
