<script setup>
import { DEV_ACCOUNT, SHOOT_ACCOUNT } from '@/constants'
import { userInfo } from '@/views/index/data'
import dayjs from 'dayjs'
import { computed } from 'vue'
import QrIcon from '../components/qrIcon.vue'

const now = dayjs()

const devYears = computed(() => {
  return now.diff(dayjs(userInfo.value.devYears), 'year')
})
const shootYears = computed(() => {
  return now.diff(dayjs(userInfo.value.shootYears), 'year')
})
</script>

<template>
  <div class="w-dwh flex-c relative z-10 overflow-hidden bg-sf-bg py-36 text-sf-text" id="about">
    <!-- 背景装饰 -->
    <div
      class="breath absolute -top-20 -right-20 rounded-full bg-sf-theme/30 blur-[100px] will-change-transform"
      :class="[$s(80, 'w'), $s(80, 'h')]"
    ></div>
    <div
      class="breath breath-delayed absolute -bottom-10 -left-10 rounded-full bg-sf-primary/20 blur-[80px] will-change-transform"
      :class="[$s(60, 'w'), $s(60, 'h')]"
    ></div>

    <!-- 主卡片 -->
    <div
      class="relative flex flex-col items-center justify-center rounded-3xl border border-sf-border bg-sf-bg shadow-2xl backdrop-blur-xl transition-all"
      :class="[$s(10, 'p'), $s(6, 'gap')]"
    >
      <!-- 个人信息 -->
      <div class="flex flex-col items-center text-center">
        <div class="mb-2 font-medium text-sf-text-2" :class="$s(5)">Hi~ 我是</div>
        <div class="font-black text-sf-theme" :class="$s(14)">
          {{ userInfo.name }}
        </div>

        <!-- 标签信息 -->
        <div class="mt-6 flex items-center justify-center gap-4 text-sf-text-2">
          <div
            class="flex items-center gap-1.5 rounded-full bg-sf-bg/50 px-3 py-1 text-sm shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
          >
            <span>📍</span>
            <span>{{ userInfo.location }}</span>
          </div>
          <div
            class="flex items-center gap-1.5 rounded-full bg-sf-bg/50 px-3 py-1 text-sm shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
          >
            <span>💻</span>
            <span>{{ userInfo.job }}</span>
          </div>
        </div>
      </div>

      <!-- 社交账号 -->
      <div class="mt-2 flex flex-wrap justify-center gap-4">
        <QrIcon v-for="item in SHOOT_ACCOUNT" :key="item.name" :item="item" />
        <div class="mx-2 h-8 w-px self-center bg-sf-border/50"></div>
        <QrIcon v-for="item in DEV_ACCOUNT" :key="item.name" :item="item" />
      </div>

      <!-- 悬浮经验卡片 - 开发 -->
      <div
        class="h absolute top-8 -right-16 rotate-12 transform cursor-default rounded-xl border border-sf-border/50 bg-sf-bg/80 p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:rotate-0 hover:border-sf-theme"
      >
        <div class="flex flex-col items-center">
          <div class="font-bold text-sf-theme" :class="$s(8)">
            {{ devYears }}<span class="ml-1 text-sm text-sf-text-2">年</span>
          </div>
          <div class="text-xs font-medium text-sf-text-2">开发经验</div>
        </div>
      </div>

      <!-- 悬浮经验卡片 - 摄影 -->
      <div
        class="absolute bottom-8 -left-12 -rotate-12 transform cursor-default rounded-xl border border-sf-border/50 bg-sf-bg/80 p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:rotate-0 hover:border-sf-theme hover:shadow-sf-theme/20"
      >
        <div class="flex flex-col items-center">
          <div class="font-bold text-sf-theme" :class="$s(8)">
            {{ shootYears }}<span class="ml-1 text-sm text-sf-text-2">年</span>
          </div>
          <div class="text-xs font-medium text-sf-text-2">摄影经验</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.breath {
  animation: breath 8s ease-in-out infinite;
}
.breath-delayed {
  animation-delay: 4s;
}
@keyframes breath {
  0%,
  100% {
    transform: scale(1) translate(0, 0);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2) translate(10px, -10px);
    opacity: 0.6;
  }
}
</style>
