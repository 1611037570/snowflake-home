<script setup>
import { userInfo } from '@/views/index/data'
import dayjs from 'dayjs'
import { computed } from 'vue'
const now = dayjs()

const devYears = computed(() => {
  return now.diff(dayjs(userInfo.value.devYears), 'year')
})
const shootYears = computed(() => {
  return now.diff(dayjs(userInfo.value.shootYears), 'year')
})
</script>

<template>
  <div
    class="w-dwh flex-c relative min-h-dvh overflow-hidden bg-sf-bg text-sf-theme-text"
    id="about"
  >
    <!-- 背景装饰 -->
    <div
      class="breath absolute -top-20 -right-20 rounded-full bg-sf-theme-hover blur-3xl will-change-transform"
      :class="[$s(60, 'w'), $s(60, 'h')]"
    ></div>
    <div
      class="breath breath-delayed absolute -bottom-10 -left-10 rounded-full bg-sf-theme-hover blur-2xl will-change-transform"
      :class="[$s(42, 'w'), $s(42, 'h')]"
    ></div>
    <div
      class="relative rounded-xl border border-sf-theme-hover bg-sf-theme-hover"
      :class="[$s(4, 'p')]"
    >
      <div :class="$s(16)">
        Hi~ 我是<span class="pl-4 text-sf-theme">{{ userInfo.name }}</span>
      </div>
      <div class="flex items-center" :class="$s(11)">
        现居：<span> {{ userInfo.location }} </span>的
        <span>{{ userInfo.job }}</span>
      </div>
      <div
        :class="[$s(4, 'p')]"
        class="flex-c absolute -right-12 -bottom-12 z-10 rotate-3 flex-col rounded-xl bg-sf-theme shadow-2xl transition-all duration-300 hover:scale-105 hover:rotate-0 hover:shadow-sf-theme/20"
      >
        <div class="font-bold" :class="$s(7)">{{ devYears }} <span class="text-xl">年</span></div>
        <div class="mt-1" :class="$s(3)">开发经验</div>
      </div>
      <div
        :class="[$s(4, 'p')]"
        class="flex-c absolute right-6 -bottom-12 z-10 rotate-3 flex-col rounded-xl bg-sf-theme shadow-2xl transition-all duration-300 hover:scale-105 hover:rotate-0 hover:shadow-sf-theme/20"
      >
        <div class="font-bold" :class="$s(7)">{{ shootYears }} <span class="text-xl">年</span></div>
        <div class="mt-1" :class="$s(3)">摄影经验</div>
      </div>
    </div>
    <div class="flex-c absolute bottom-12 left-0 w-full text-4xl text-sf-base">v</div>
  </div>
</template>

<style lang="scss" scoped>
.breath {
  animation: breath 4s ease-in-out infinite;
}
.breath-delayed {
  animation-delay: 2s;
}
@keyframes breath {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}
</style>
