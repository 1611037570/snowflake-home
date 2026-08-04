<template>
  <div>
    <!-- 进度条 -->
    <div class="px-6 pt-4">
      <div class="h-2 overflow-hidden rounded-full bg-black/20">
        <div
          class="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
    </div>

    <!-- 比较文字 -->
    <div
      class="m-6 rounded-lg bg-gradient-to-r from-blue-800/40 to-purple-800/40 p-4 text-center text-xl font-bold text-white transition-all duration-300"
      :class="comparisonClass"
    >
      {{ state.comparisonText }}
    </div>

    <!-- 可视化柱状图 -->
    <div class="p-6">
      <div class="flex h-64 items-end justify-center space-x-2 rounded-xl bg-black/20 p-4">
        <div
          v-for="(item, index) in data"
          :key="index"
          class="flex flex-col items-center transition-all duration-500"
          :class="{
            'scale-105 transform': index === state.currentIndex || index === state.currentIndex + 1,
            'z-10': index === state.currentIndex || index === state.currentIndex + 1,
          }"
        >
          <div
            class="relative w-12 rounded-t-lg transition-all duration-500"
            :style="{ height: (item / maxValue) * 200 + 'px' }"
            :class="getBarClass(index)"
          >
            <div
              class="absolute -top-8 left-1/2 -translate-x-1/2 transform text-sm font-bold text-white"
            >
              {{ index === state.currentIndex || index === state.currentIndex + 1 ? item : '' }}
            </div>
          </div>
          <div class="mt-2 font-medium text-white">
            {{ item }}
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="border-t border-white/10 p-6">
      <div class="flex flex-wrap justify-center gap-6">
        <div v-for="(item, index) in legendItems" :key="index" class="flex items-center gap-2">
          <div class="h-5 w-5 rounded" :class="item.color"></div>
          <span class="text-sm text-white">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  state: {
    type: Object,
    required: true,
  },
  status: {
    type: Object,
    required: true,
  },
})

const maxValue = computed(() => Math.max(...props.data))

const progressPercentage = computed(() => {
  if (props.data.length <= 1) return 0
  return (props.state.currentRound / (props.data.length - 1)) * 100
})

const comparisonClass = computed(() => {
  if (props.status.isCompleted) return 'bg-gradient-to-r from-green-800/40 to-teal-800/40'
  if (props.state.isSwapping) return 'bg-gradient-to-r from-yellow-800/40 to-orange-800/40'
  if (props.state.isComparing) return 'bg-gradient-to-r from-red-800/40 to-pink-800/40'
  return 'bg-gradient-to-r from-blue-800/40 to-purple-800/40'
})

const legendItems = [
  { color: 'bg-gradient-to-b from-blue-500 to-blue-700', label: '正常元素' },
  { color: 'bg-gradient-to-b from-red-500 to-red-700', label: '比较中' },
  { color: 'bg-gradient-to-b from-yellow-500 to-yellow-700', label: '交换中' },
  { color: 'bg-gradient-to-b from-green-500 to-green-700', label: '已排序' },
]

const getBarClass = (index) => {
  if (props.status.isCompleted) return 'bg-gradient-to-b from-green-500 to-green-700'
  if (
    props.state.isSwapping &&
    (index === props.state.currentIndex || index === props.state.currentIndex + 1)
  ) {
    return 'bg-gradient-to-b from-yellow-500 to-yellow-700'
  }
  if (
    props.state.isComparing &&
    (index === props.state.currentIndex || index === props.state.currentIndex + 1)
  ) {
    return 'bg-gradient-to-b from-red-500 to-red-700'
  }
  if (index >= props.data.length - props.state.currentRound) {
    return 'bg-gradient-to-b from-green-500 to-green-700'
  }
  return 'bg-gradient-to-b from-blue-500 to-blue-700'
}
</script>
