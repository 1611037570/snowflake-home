<script setup>
import { userInfo } from '@/views/index/data'
import dayjs from 'dayjs'
const now = dayjs()

const devYears = now.diff(dayjs(userInfo.devYears), 'year')
const shootYears = now.diff(dayjs(userInfo.shootYears), 'year')
</script>

<template>
  <div
    class="w-dwh flex-c relative min-h-dvh overflow-hidden bg-sf-bg text-sf-theme-text"
    id="about"
  >
    <!-- 背景装饰 -->
    <div
      class="breath absolute -top-10 -right-10 h-50 w-50 rounded-full bg-sf-theme-hover blur-3xl will-change-transform"
    ></div>
    <div
      class="breath breath-delayed absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-sf-theme-hover blur-2xl will-change-transform"
    ></div>
    <div class="relative h-[200px] rounded-xl border border-sf-theme-hover bg-sf-theme-hover p-4">
      <div class="text-7xl">
        Hi~ 我是<span class="pl-4 text-sf-theme">{{ userInfo.name }}</span>
      </div>
      <div class="flex items-center">
        现居：<span class="text-xl"> {{ userInfo.location }} </span>的
        <div class="text-3xl">{{ userInfo.job }}</div>
      </div>
      <div
        class="flex-c absolute -right-12 -bottom-12 z-10 h-22 w-22 rotate-3 flex-col rounded-xl bg-sf-theme shadow-2xl transition-all duration-300 hover:scale-105 hover:rotate-0 hover:shadow-sf-theme/20"
      >
        <div class="text-3xl font-bold">{{ devYears }} <span class="text-xl">年</span></div>
        <div class="mt-1 text-sm">开发经验</div>
      </div>
      <div
        class="flex-c absolute right-6 -bottom-12 z-10 h-22 w-22 rotate-3 flex-col rounded-xl bg-sf-theme shadow-2xl transition-all duration-300 hover:scale-105 hover:rotate-0 hover:shadow-sf-theme/20"
      >
        <div class="text-3xl font-bold">{{ shootYears }} <span class="text-xl">年</span></div>
        <div class="mt-1 text-sm">摄影经验</div>
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
