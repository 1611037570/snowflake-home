<template>
  <!-- 容器 - 固定定位 -->
  <div
    class="fixed bottom-12 left-0 z-50 h-auto w-68 transition-transform duration-300"
    :class="[containerClasses]"
    @mouseenter="expand = true"
    @mousemove="expand = true"
    @mouseleave="expand = false"
  >
    <div style="zoom: 0.8" class="flex flex-col items-center justify-center gap-6">
      <!-- 冥想组件 -->
      <Meditation></Meditation>
      <!-- 幸运转盘组件 -->
      <LuckyWheel></LuckyWheel>
      <!-- 收入组件 -->
      <Income></Income>
      <!-- 木鱼组件 -->
      <WoodenFish></WoodenFish>
    </div>
  </div>
</template>

<script setup>
import Income from './income.vue'
import LuckyWheel from './luckyWheel.vue'
import Meditation from './meditation.vue'
import WoodenFish from './woodenFish.vue'
const expand = ref(false)

const containerClasses = computed(() => {
  return expand.value ? 'translate-x-[0%]' : 'translate-x-[-48%]'
})
</script>

<style scoped></style>
