<template>
  <!-- 木鱼容器 -->
  <div
    class="relative flex h-20 w-20 flex-col items-center justify-center"
    @mousedown="downWoodenFish"
  >
    <!-- 木鱼图标 -->
    <div
      class="flex min-h-15 min-w-15 cursor-pointer items-center justify-center rounded-lg transition-all duration-300 ease-out"
      :class="isKnocking ? 'scale-95 bg-amber-600' : 'bg-amber-700'"
    >
      <Icon
        icon="mdi:fish"
        class="h-10 w-10 text-amber-100"
        :class="isKnocking ? 'animate-pulse' : ''"
      />
    </div>
    <!-- 计数器 -->
    <div class="w-auto whitespace-nowrap">功德：{{ fishCount }}</div>
    <!-- 功德+1动画效果 -->
    <div
      class="left-1/2-translate-x-1/2 absolute text-xl font-bold text-amber-300 transition-all duration-500 ease-linear"
      :class="showAdd ? 'bottom-12' : 'bottom-0'"
    >
      {{ showAdd ? '+1' : '' }}
    </div>
    <!-- 木鱼棒 -->
    <div
      class="absolute top-4 left-10 flex h-4 w-15 items-center justify-center rounded-full bg-amber-800 transition-all duration-100"
      :style="{ rotate: isKnocking ? '0deg' : '40deg' }"
    >
      <div class="h-1 w-12 rounded-full bg-amber-600"></div>
      <div
        class="absolute top-1/2 -left-2 h-6 w-6 -translate-y-1/2 rounded-full bg-amber-900"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

// 从游戏状态存储中获取功德计数器
const gameStore = useGameStore()
const { fishCount } = storeToRefs(gameStore)

// 敲击状态
const isKnocking = ref(false)
// 功德+1动画显示状态
const showAdd = ref(false)

// 敲击木鱼函数
function downWoodenFish() {
  // 增加计数
  fishCount.value++

  // 设置敲击状态为true
  isKnocking.value = true

  // 触发功德+1动画
  showAdd.value = true
  setTimeout(() => {
    showAdd.value = false
  }, 501) // 与动画持续时间匹配

  // 添加document级别的mouseup事件监听器
  document.addEventListener('mouseup', handleMouseUp)

  // 清理函数
  function handleMouseUp() {
    upWoodenFish()
    document.removeEventListener('mouseup', handleMouseUp)
  }
}

// 重置敲击状态函数
function upWoodenFish() {
  isKnocking.value = false
}
</script>

<style scoped></style>
