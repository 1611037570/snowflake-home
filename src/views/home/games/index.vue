<template>
  <!-- 容器 - 固定定位 -->
  <div class="fixed top-1/2 bottom-0 left-0 z-20 w-48">
    <div v-if="tabIndex == 1 || 1" class="fixed bottom-12 left-12 z-20" style="zoom: 0.8">
      <!-- 冥想组件 -->
      <Meditation class="mt-12"></Meditation>
      <!-- 幸运转盘组件 -->
      <LuckyWheel class="mt-12"></LuckyWheel>
      <!-- 收入组件 -->
      <Income class="mt-12"></Income>
      <!-- 木鱼组件 -->
      <WoodenFish class="mt-12"></WoodenFish>
    </div>
  </div>
</template>

<script setup>
import { useHomeStore } from '@/stores'
import Income from './income.vue'
import LuckyWheel from './luckyWheel.vue'
import Meditation from './meditation.vue'
import WoodenFish from './woodenFish.vue'
const homeStore = useHomeStore()
const { tabIndex } = storeToRefs(homeStore)
</script>

<style scoped></style>
