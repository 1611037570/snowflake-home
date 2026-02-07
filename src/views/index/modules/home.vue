<script setup>
import { da_ai_xian_zun, fixed } from '@/constants'
import { onMounted, ref } from 'vue'

const showContent = ref(false)

onMounted(() => {
  // 稍微延迟以确保过渡动画流畅
  setTimeout(() => {
    showContent.value = true
  }, 300)
})

function scrollToAbout() {
  const targetElement = document.getElementById('about')
  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

const list = [...fixed, ...da_ai_xian_zun].map((item) => ({
  text: item.value,
}))
</script>

<template>
  <div
    class="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-sf-bg"
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
      <!-- 主标题 -->
      <h1
        class="text-yyqx text-6xl font-black tracking-widest text-sf-base drop-shadow-2xl transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:text-8xl"
        style="text-shadow: 0 0 30px var(--sf-theme)"
        :class="
          showContent ? 'blur-0 translate-y-0 opacity-100' : 'translate-y-12 opacity-0 blur-sm'
        "
      >
        逆转时空的公式
      </h1>

      <!-- 装饰线：极简风格，动态展开 -->
      <div
        class="h-[2px] rounded-full bg-gradient-to-r from-transparent via-sf-theme to-transparent shadow-[0_0_15px_var(--sf-theme)] transition-all delay-300 duration-1000 ease-out"
        :class="showContent ? 'w-64 opacity-80' : 'w-0 opacity-0'"
      ></div>

      <!-- 副标题 -->
      <p
        class="text-yyqx text-2xl font-light tracking-[0.5em] text-sf-text-2 transition-all delay-500 duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:text-4xl"
        :class="
          showContent ? 'blur-0 translate-y-0 opacity-100' : 'translate-y-8 opacity-0 blur-sm'
        "
      >
        就是珍惜当下
      </p>
    </div>

    <!-- 底部引导 -->
    <div
      class="absolute bottom-12 z-20 flex flex-col items-center gap-4 transition-all delay-1000 duration-1000"
      :class="showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'"
    >
      <span class="text-xs tracking-[0.4em] text-sf-text-3 uppercase opacity-60">Scroll</span>
      <SfIcon
        icon="mingcute:down-line"
        size="28"
        class="animate-bounce cursor-pointer text-sf-text-2 transition-all duration-300 hover:scale-125 hover:text-sf-theme hover:drop-shadow-[0_0_8px_var(--sf-theme)]"
        @click="scrollToAbout"
      />
    </div>
  </div>
</template>

<style scoped>
/* 增加更细腻的动画曲线 */
.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>
