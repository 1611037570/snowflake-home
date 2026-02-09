<script setup>
import { da_ai_xian_zun, fixed } from '@/constants'
import { onMounted, ref } from 'vue'
import Background from './background.vue'
import ScrollGuide from './scroll-guide.vue'
const showContent = ref(false)

onMounted(() => {
  // 稍微延迟以确保过渡动画流畅
  setTimeout(() => {
    showContent.value = true
  }, 300)
})

const list = [...fixed, ...da_ai_xian_zun].map((item) => ({
  text: item.value,
}))
</script>

<template>
  <div class="w-dwh flex-c relative z-10 min-h-dvh"></div>
  <Background />
  <div
    class="fixed inset-0 z-10 flex h-dvh w-full flex-col items-center justify-center overflow-hidden"
  >
    <!-- 背景层：弹幕 + 渐变遮罩 -->
    <div class="absolute inset-0 z-0 opacity-20 transition-opacity duration-1000 hover:opacity-30">
      <SfBarrage :list="list" />
    </div>
    <!-- 径向渐变遮罩，让中心文字更清晰 -->
    <div
      class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,var(--sf-background)_100%)]"
    ></div>

    <!-- 内容区域 -->
    <div class="z-10 flex flex-col items-center gap-12 select-none">
      <!-- 主标题区域 -->
      <div class="relative flex flex-col items-center gap-6">
        <h1
          class="text-yyqx relative z-10 text-4xl font-black tracking-[0.2em] text-sf-base transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:text-7xl"
          :class="[
            showContent ? 'blur-0 translate-y-0 opacity-100' : 'translate-y-12 opacity-0 blur-md',
          ]"
        >
          我会找到逆转时间的公式
        </h1>

        <!-- 装饰装饰条 -->
        <div
          class="h-[1px] bg-gradient-to-r from-transparent via-sf-theme to-transparent transition-all delay-300 duration-[1500ms] ease-out"
          :class="showContent ? 'w-48 opacity-100' : 'w-0 opacity-0'"
        ></div>

        <!-- 副标题 -->
        <p
          class="text-xs font-light tracking-[0.6em] text-sf-text-3 uppercase transition-all delay-500 duration-1000 ease-out md:text-sm"
          :class="showContent ? 'translate-y-0 opacity-60' : 'translate-y-8 opacity-0'"
        >
          Searching for the formula to reverse time
        </p>
      </div>
    </div>

    <ScrollGuide :show="showContent" />
  </div>
</template>

<style scoped></style>
