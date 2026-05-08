<template>
  <div
    @click="goMe"
    class="mx-auto mb-6 flex w-fit cursor-pointer items-center rounded-full bg-sf-theme/10 px-4 py-2 text-sm font-medium text-sf-theme transition-colors duration-200 hover:bg-sf-theme hover:text-sf-theme-text"
  >
    <span>小羊</span>
  </div>
  <!-- 项目运行时间卡片 -->
  <div class="pX-6 text-center">
    <h3 class="mb-3 text-base font-medium text-sf-text-2">网站已运行</h3>
    <p class="text-4xl font-bold text-sf-theme transition-colors duration-200">
      {{ runTimeDescription }}
    </p>
    <div class="mt-4 inline-flex rounded-full bg-sf-bg-hover px-3 py-1 text-sm text-sf-text-2">
      自 {{ startTime }} 以来
    </div>
  </div>
</template>

<script setup>
import { urlNavigation } from '@/utils'
import dayjs from 'dayjs'

function goMe() {
  urlNavigation('/index')
}

// 项目开始时间
const startTime = '2020-09-03'

// 计算项目运行天数
const runDays = computed(() => {
  const start = dayjs(startTime)
  const now = dayjs()
  return now.diff(start, 'day')
})

// 计算项目运行时间的详细描述
const runTimeDescription = computed(() => {
  const description = `${runDays.value}天`

  return description
})
</script>
