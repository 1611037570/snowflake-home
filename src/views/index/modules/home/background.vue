<template>
  <!-- 背景渐变容器（含过渡动画） -->
  <div
    class="fixed inset-0 z-10 min-h-dvh w-full transition-colors duration-700 ease-out"
    :style="{
      background: `radial-gradient(ellipse at 50% 50%, ${bgGradientStart}, ${bgGradientEnd})`,
    }"
  >
    <!-- 三个独立路径浮动的光晕球体 -->
    <div
      v-for="(ball, index) in balls"
      :key="index"
      class="ball absolute rounded-full will-change-transform"
      :class="[$s(ball.size, 'w'), $s(ball.size, 'h')]"
      :style="{
        background: ball.gradient,
        top: ball.top,
        left: ball.left,
        right: ball.right,
        bottom: ball.bottom,
        filter: 'blur(90px)',
        opacity: isDark ? 0.55 : 0.85,
        zIndex: 2,
        animationName: `float${index + 1}`,
        animationDuration: `${ball.duration}s`,
        animationDelay: `${ball.delay}s`,
        animationIterationCount: 'infinite',
        animationTimingFunction: 'cubic-bezier(0.45, 0, 0.55, 1)',
        animationDirection: 'alternate',
      }"
    />

    <!-- 点阵背景层 -->
    <div
      class="pointer-events-none absolute inset-0"
      :style="{
        backgroundImage: `radial-gradient(circle at 1px 1px, ${dotColor} 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }"
    />

    <!-- 中心环境光晕（增强氛围） -->
    <div
      class="pointer-events-none absolute rounded-full"
      :class="[$s(120, 'w'), $s(120, 'h')]"
      :style="{
        background: `radial-gradient(circle, ${envGlow} 0%, transparent 70%)`,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(80px)',
        opacity: 0.5,
        zIndex: 12,
        willChange: 'transform, filter',
      }"
    />
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores'
import { storeToRefs } from 'pinia'

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

// 背景渐变（带过渡）
const bgGradientStart = computed(() => (isDark.value ? '#0f172a' : '#f1f5f9'))
const bgGradientEnd = computed(() => (isDark.value ? '#1e293b' : '#e2e8f0'))

// 点阵颜色
const dotColor = computed(() => (isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.3)'))

// 环境光晕颜色
const envGlow = computed(() =>
  isDark.value ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)',
)

// 球体配置（颜色微调，更通透）
const lightBalls = [
  {
    size: 100,
    top: '10%',
    left: '5%',
    right: null,
    bottom: null,
    color1: 'rgba(124, 58, 237, 0.65)',
    color2: 'rgba(139, 92, 246, 0.4)',
    color3: 'rgba(124, 58, 237, 0)',
    delay: 0,
    duration: 14,
  },
  {
    size: 70,
    top: null,
    left: null,
    right: '5%',
    bottom: '8%',
    color1: 'rgba(6, 182, 212, 0.55)',
    color2: 'rgba(34, 211, 238, 0.35)',
    color3: 'rgba(6, 182, 212, 0)',
    delay: 2.5,
    duration: 16,
  },
  {
    size: 80,
    top: null,
    left: null,
    right: '18%',
    bottom: '28%',
    color1: 'rgba(236, 72, 153, 0.5)',
    color2: 'rgba(244, 114, 182, 0.3)',
    color3: 'rgba(236, 72, 153, 0)',
    delay: 1.2,
    duration: 18,
  },
]

const darkBalls = [
  {
    size: 100,
    top: '8%',
    left: '3%',
    right: null,
    bottom: null,
    color1: 'rgba(139, 92, 246, 0.7)',
    color2: 'rgba(167, 139, 250, 0.35)',
    color3: 'rgba(139, 92, 246, 0)',
    delay: 0,
    duration: 14,
  },
  {
    size: 70,
    top: null,
    left: null,
    right: '3%',
    bottom: '6%',
    color1: 'rgba(34, 211, 238, 0.5)',
    color2: 'rgba(103, 232, 249, 0.25)',
    color3: 'rgba(34, 211, 238, 0)',
    delay: 2.5,
    duration: 16,
  },
  {
    size: 80,
    top: null,
    left: null,
    right: '16%',
    bottom: '26%',
    color1: 'rgba(244, 114, 182, 0.45)',
    color2: 'rgba(251, 146, 201, 0.2)',
    color3: 'rgba(244, 114, 182, 0)',
    delay: 1.2,
    duration: 18,
  },
]

const balls = computed(() => {
  const base = isDark.value ? darkBalls : lightBalls
  return base.map((b) => ({
    ...b,
    gradient: `radial-gradient(circle at 40% 35%, ${b.color1} 0%, ${b.color2} 50%, ${b.color3} 100%)`,
  }))
})
</script>

<style lang="scss" scoped>
/* 三个独立的浮动路径，仅变换 translate3d，GPU 加速 */
@keyframes float1 {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  25% {
    transform: translate3d(60px, -80px, 0);
  }
  50% {
    transform: translate3d(120px, 0, 0);
  }
  75% {
    transform: translate3d(60px, 80px, 0);
  }
}

@keyframes float2 {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  25% {
    transform: translate3d(-70px, -60px, 0);
  }
  50% {
    transform: translate3d(-130px, 0, 0);
  }
  75% {
    transform: translate3d(-70px, 60px, 0);
  }
}

@keyframes float3 {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  25% {
    transform: translate3d(50px, 90px, 0);
  }
  50% {
    transform: translate3d(100px, 0, 0);
  }
  75% {
    transform: translate3d(50px, -90px, 0);
  }
}

.ball {
  /* 强制合成层，优化模糊滤镜渲染 */
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform, filter;
}
</style>
