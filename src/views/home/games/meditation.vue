<template>
  <div
    class="relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-gray-100 transition-colors hover:bg-gray-50"
    @click="toggleMeditation"
  >
    <!-- 冥想模式（呼吸引导动画+计时） -->
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <!-- 呼吸圆圈动画 -->
      <div
        class="absolute rounded-full bg-blue-200 transition-all duration-4000 ease-in-out"
        :style="{
          width: `${breathSize}%`,
          height: `${breathSize}%`,
          opacity: breathOpacity,
          visibility: isActive ? 'visible' : 'hidden',
        }"
      ></div>

      <!-- 状态显示（非激活时显示"冥想"，激活时显示时间和状态） -->
      <div v-if="!isActive" class="relative z-10 font-medium text-gray-600">冥想</div>

      <div v-else class="relative z-10 flex flex-col items-center">
        <span class="font-medium text-blue-700"> {{ Math.ceil(remainingTime) }}s </span>
        <span class="mt-1 text-xs text-blue-500">
          {{ breathStatus }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onUnmounted, ref } from 'vue'

// 核心状态管理
const isActive = ref(false) // 是否正在冥想
const remainingTime = ref(30) // 剩余时间（秒）
const breathSize = ref(60) // 呼吸圆圈大小（百分比）
const breathOpacity = ref(0.6) // 呼吸圆圈透明度
const breathStatus = ref('准备') // 呼吸状态提示
let breathInterval = null // 呼吸动画定时器
let timerInterval = null // 倒计时定时器

// 切换冥想状态（开始/暂停）
const toggleMeditation = () => {
  if (isActive.value) {
    // 暂停冥想
    clearInterval(breathInterval)
    clearInterval(timerInterval)
  } else {
    // 开始冥想
    startBreathAnimation()
    startTimer()
  }
  isActive.value = !isActive.value
}

// 呼吸动画逻辑（4秒周期：2秒吸气→2秒呼气）
const startBreathAnimation = () => {
  // 初始状态
  breathSize.value = 60
  breathOpacity.value = 0.4
  breathStatus.value = '吸气'

  breathInterval = setInterval(() => {
    // 吸气阶段（放大+加深）
    breathSize.value = 100
    breathOpacity.value = 0.8
    breathStatus.value = '吸气'

    setTimeout(() => {
      // 呼气阶段（缩小+变浅）
      breathSize.value = 60
      breathOpacity.value = 0.4
      breathStatus.value = '呼气'
    }, 2000)
  }, 4000)
}

// 30秒倒计时逻辑
const startTimer = () => {
  timerInterval = setInterval(() => {
    remainingTime.value -= 0.1
    if (remainingTime.value <= 0) {
      // 计时结束自动停止
      clearInterval(breathInterval)
      clearInterval(timerInterval)
      isActive.value = false
      remainingTime.value = 30
      breathStatus.value = '完成'
    }
  }, 100)
}

// 组件卸载时清理定时器
onUnmounted(() => {
  clearInterval(breathInterval)
  clearInterval(timerInterval)
})
</script>
