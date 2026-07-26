<script setup>
import { da_ai_xian_zun, fixed } from '@/constants'
import { onMounted, ref } from 'vue'
import Background from './background.vue'
import ScrollGuide from './scroll-guide.vue'

const showContent = ref(false)
const isHoveredFormula = ref(false) // 控制第二行文字悬停状态

onMounted(() => {
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
    <!-- 径向渐变遮罩 -->
    <div
      class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,var(--sf-background)_100%)]"
    ></div>

    <!-- 内容区域 -->
    <div class="z-10 flex flex-col items-center gap-12 select-none">
      <!-- 主标题区域 -->
      <div class="relative flex flex-col items-center gap-6">
        <!-- 给 h1 添加 mouseleave 事件，作为全局重置保险 -->
        <h1
          class="text-yyqx relative z-10 flex flex-col items-center text-center text-4xl leading-[1.6] font-black tracking-[0.2em] text-sf-base transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:text-7xl"
          :class="[
            showContent ? 'blur-0 translate-y-0 opacity-100' : 'translate-y-12 opacity-0 blur-md',
          ]"
          @mouseleave="isHoveredFormula = false"
        >
          <span>{{ isHoveredFormula ? '我找到了' : '我会找到' }}</span>
          <div class="inline-block py-1">
            <span v-if="!isHoveredFormula" class="unfold" @mouseenter="isHoveredFormula = true">
              <span class="text-sf-theme">逆转时间</span>的公式
            </span>
            <div v-else class="unfold flex items-center" @mouseleave="isHoveredFormula = false">
              其实就是<span class="text-sf-theme">珍惜当下</span>
            </div>
          </div>
        </h1>

        <!-- 装饰装饰条 -->
        <div
          class="h-[1px] bg-gradient-to-r from-transparent via-sf-theme to-transparent transition-all delay-300 duration-[1500ms] ease-out"
          :class="showContent ? 'w-48 opacity-100' : 'w-0 opacity-0'"
        ></div>

        <!-- 副标题 -->
        <p
          class="text-xs font-light tracking-[0.6em] text-sf-text-2 transition-all delay-500 duration-1000 ease-out md:text-sm"
          :class="showContent ? 'translate-y-0 opacity-60' : 'translate-y-8 opacity-0'"
        >
          Then I'll come back to you
        </p>
      </div>
    </div>

    <ScrollGuide :show="showContent" />
  </div>
</template>

<style scoped>
/* 跳动动画 */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}
.bounce {
  display: inline-block;
  animation: bounce 1.2s ease-in-out infinite;
}

/* 卷轴展开动画（从中间向左右展开） */
@keyframes unfold {
  0% {
    clip-path: inset(0 50% 0 50%);
  }
  100% {
    clip-path: inset(0 0% 0 0%);
  }
}
.unfold {
  display: inline-block;
  clip-path: inset(0 50% 0 50%);
  animation: unfold 0.8s ease forwards;
}
</style>
