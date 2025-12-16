<script setup>
import { userInfo } from '@/views/index/data'
import dayjs from 'dayjs'
import { computed, ref } from 'vue'
const now = dayjs()

const devYears = computed(() => {
  return now.diff(dayjs(userInfo.value.devYears), 'year')
})
const shootYears = computed(() => {
  return now.diff(dayjs(userInfo.value.shootYears), 'year')
})

// Tab核心配置：垂直标签+双色+内容映射
const activeTab = ref('shoot') // shoot=摄影(上标签) dev=开发(下标签)
const tabConfig = {
  shoot: {
    name: '摄影号',
    color: 'from-rose-500 to-rose-600', // 摄影标签色（可自定义）
    border: 'border-rose-400/50',
    shadow: 'shadow-rose-500/30',
    list: ['抖音', '小红书', '图虫'], // 平台列表（前）
  },
  dev: {
    name: '开发号',
    color: 'from-blue-500 to-blue-600', // 开发标签色（可自定义）
    border: 'border-blue-400/50',
    shadow: 'shadow-blue-500/30',
    list: ['GitHub', '稀土掘金', 'Gitee'],
  },
}
</script>

<template>
  <div
    class="w-dwh flex-c relative z-10 min-h-dvh overflow-hidden bg-sf-bg text-sf-theme-text"
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
    <!-- 信息区 -->
    <div
      class="relative rounded-xl border border-sf-theme-hover bg-sf-theme-hover"
      :class="[$s(4, 'p')]"
    >
      <!-- 优化后：书本标签式账号板块（超出右侧+美化） -->
      <div
        :class="[$s(4, 'p')]"
        class="absolute -top-16 right-0 z-10 flex flex-col gap-1 transition-all duration-500"
        style="transform-origin: right center"
      >
        <!-- 标签容器：垂直上下排列的书本标签（超出右侧） -->
        <div class="relative mr-[-20px] flex flex-col gap-1">
          <!-- 超出右侧20px -->
          <!-- 上标签：摄影号 -->
          <div
            @click="activeTab = 'shoot'"
            class="relative flex h-14 cursor-pointer items-center justify-between overflow-hidden rounded-l-xl rounded-r-md border border-r-0 px-5 py-2 pr-10 transition-all duration-400"
            :class="[
              tabConfig.shoot.border,
              activeTab === 'shoot'
                ? 'z-20 translate-x-0 scale-102 shadow-xl'
                : 'z-10 translate-x-3 opacity-85 shadow-md hover:translate-x-1 hover:opacity-95',
              'bg-gradient-to-r ' + tabConfig.shoot.color,
              'shadow ' + tabConfig.shoot.shadow,
            ]"
          >
            <!-- 平台区（前） -->
            <div class="flex gap-2 text-sm text-white/95">
              <span v-if="activeTab === 'shoot'" class="font-medium">
                {{ tabConfig.shoot.list.join(' / ') }}
              </span>
            </div>
            <!-- 账号名（右） -->
            <div class="ml-4 flex items-center gap-1 text-sm font-semibold text-white">
              {{ tabConfig.shoot.name }}
              <svg
                class="h-3 w-3"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 8L6 11L9 8" stroke="white" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
            <!-- 书本标签折角装饰（优化） -->
            <div
              class="absolute top-0 -right-1 h-full w-6 rounded-br-md bg-gradient-to-l from-white/15 to-transparent"
            ></div>
            <!-- 标签高光装饰 -->
            <div
              class="absolute top-0 left-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-white/30 to-transparent"
            ></div>
          </div>

          <!-- 下标签：开发号 -->
          <div
            @click="activeTab = 'dev'"
            class="relative flex h-14 cursor-pointer items-center justify-between overflow-hidden rounded-l-xl rounded-r-md border border-r-0 px-5 py-2 pr-10 transition-all duration-400"
            :class="[
              tabConfig.dev.border,
              activeTab === 'dev'
                ? 'z-20 translate-x-0 scale-102 shadow-xl'
                : 'z-10 translate-x-3 opacity-85 shadow-md hover:translate-x-1 hover:opacity-95',
              'bg-gradient-to-r ' + tabConfig.dev.color,
              'shadow ' + tabConfig.dev.shadow,
            ]"
          >
            <!-- 平台区（前） -->
            <div class="flex gap-2 text-sm text-white/95">
              <span v-if="activeTab === 'dev'" class="font-medium">
                {{ tabConfig.dev.list.join(' / ') }}
              </span>
            </div>
            <!-- 账号名（右） -->
            <div class="ml-4 flex items-center gap-1 text-sm font-semibold text-white">
              {{ tabConfig.dev.name }}
              <svg
                class="h-3 w-3"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 8L6 11L9 8" stroke="white" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
            <!-- 书本标签折角装饰（优化） -->
            <div
              class="absolute top-0 -right-1 h-full w-6 rounded-br-md bg-gradient-to-l from-white/15 to-transparent"
            ></div>
            <!-- 标签高光装饰 -->
            <div
              class="absolute top-0 left-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-white/30 to-transparent"
            ></div>
          </div>

          <!-- 抽开式内容面板（适配超出右侧的标签） -->
          <div
            class="absolute top-1/2 left-0 flex h-22 w-52 -translate-y-1/2 items-center justify-center rounded-lg border border-white/15 bg-white/8 shadow-xl backdrop-blur-md transition-all duration-400"
            :class="[
              activeTab === 'shoot' ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
              activeTab === 'dev' ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
            ]"
            style="
              box-shadow:
                0 8px 32px rgba(0, 0, 0, 0.1),
                0 2px 8px rgba(0, 0, 0, 0.05);
            "
          >
            <div class="flex flex-wrap justify-center gap-2 text-xs text-white/95">
              <span
                v-for="(item, idx) in tabConfig[activeTab].list"
                :key="idx"
                class="rounded-full bg-white/10 px-2 py-1 transition-colors hover:bg-white/20"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </div>
      </div>

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

// 标签hover时的全局过渡优化
:deep(.hover\:scale-102) {
  transform: scale(1.02);
}
</style>
