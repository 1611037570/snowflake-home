<template>
  <!-- 背景渐变容器（含过渡动画） -->
  <div
    class="fixed inset-0 z-10 min-h-dvh w-full transition-colors duration-1000 ease-out"
    :style="{
      background: `radial-gradient(ellipse at 50% 50%, ${bgGradientStart}, ${bgGradientEnd})`,
    }"
  >
    <!-- 四个独立路径浮动的光晕球体 -->
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
        filter: `blur(${ball.blur}px)`,
        opacity: ball.opacity,
        zIndex: 2,
        animationName: `float${index + 1}`,
        animationDuration: `${ball.duration}s`,
        animationDelay: `${ball.delay}s`,
        animationIterationCount: 'infinite',
        animationTimingFunction: 'cubic-bezier(0.45, 0, 0.55, 1)',
        animationDirection: 'alternate',
        transform: `scale(${ball.scale})`,
      }"
    />

    <!-- 点阵背景层（带径向渐隐） -->
    <div
      class="pointer-events-none absolute inset-0"
      :style="{
        backgroundImage: `radial-gradient(circle at 1px 1px, ${dotColor} 1px, transparent 0)`,
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 85%)',
      }"
    />

    <!-- 中心环境光晕（增强氛围） -->
    <div
      class="pointer-events-none absolute rounded-full"
      :class="[$s(140, 'w'), $s(140, 'h')]"
      :style="{
        background: `radial-gradient(circle, ${envGlow} 0%, transparent 70%)`,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(100px)',
        opacity: 0.6,
        zIndex: 12,
        willChange: 'transform, filter',
      }"
    />

    <!-- 底部微光（增加层次） -->
    <div
      class="pointer-events-none absolute rounded-full"
      :class="[$s(80, 'w'), $s(80, 'h')]"
      :style="{
        background: `radial-gradient(circle, ${bottomGlow} 0%, transparent 70%)`,
        bottom: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        filter: 'blur(80px)',
        opacity: 0.3,
        zIndex: 1,
        willChange: 'transform, filter',
      }"
    />
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

// ============================================================
// 背景渐变（带过渡）
// ============================================================
const bgGradientStart = computed(() => (isDark.value ? '#0b1120' : '#faf9f6'))
const bgGradientEnd = computed(() => (isDark.value ? '#1a1a2e' : '#e8e6e1'))

// ============================================================
// 点阵颜色
// ============================================================
const dotColor = computed(() =>
  isDark.value ? 'rgba(255,255,255,0.06)' : 'rgba(148,163,184,0.28)',
)

// ============================================================
// 环境光晕颜色
// ============================================================
const envGlow = computed(() =>
  isDark.value ? 'rgba(139, 92, 246, 0.20)' : 'rgba(124, 58, 237, 0.10)',
)

const bottomGlow = computed(() =>
  isDark.value ? 'rgba(34, 211, 238, 0.12)' : 'rgba(6, 182, 212, 0.08)',
)

// ============================================================
// 球体配置（4个独立浮动路径）
// ============================================================
const ballData = [
  {
    size: 110,
    top: '5%',
    left: '2%',
    right: null,
    bottom: null,
    delay: 0,
    duration: 16,
    scale: 1,
    light: {
      color1: 'rgba(124, 58, 237, 0.50)',
      color2: 'rgba(167, 139, 250, 0.30)',
      color3: 'rgba(124, 58, 237, 0)',
      blur: 100,
      opacity: 0.75,
    },
    dark: {
      color1: 'rgba(139, 92, 246, 0.60)',
      color2: 'rgba(196, 181, 253, 0.25)',
      color3: 'rgba(139, 92, 246, 0)',
      blur: 110,
      opacity: 0.55,
    },
  },
  {
    size: 75,
    top: null,
    left: null,
    right: '2%',
    bottom: '5%',
    delay: 2.8,
    duration: 18,
    scale: 1.05,
    light: {
      color1: 'rgba(6, 182, 212, 0.45)',
      color2: 'rgba(103, 232, 249, 0.25)',
      color3: 'rgba(6, 182, 212, 0)',
      blur: 85,
      opacity: 0.7,
    },
    dark: {
      color1: 'rgba(34, 211, 238, 0.45)',
      color2: 'rgba(103, 232, 249, 0.18)',
      color3: 'rgba(34, 211, 238, 0)',
      blur: 90,
      opacity: 0.5,
    },
  },
  {
    size: 85,
    top: null,
    left: null,
    right: '16%',
    bottom: '28%',
    delay: 1.5,
    duration: 20,
    scale: 0.95,
    light: {
      color1: 'rgba(236, 72, 153, 0.40)',
      color2: 'rgba(244, 114, 182, 0.20)',
      color3: 'rgba(236, 72, 153, 0)',
      blur: 95,
      opacity: 0.65,
    },
    dark: {
      color1: 'rgba(244, 114, 182, 0.40)',
      color2: 'rgba(251, 146, 201, 0.15)',
      color3: 'rgba(244, 114, 182, 0)',
      blur: 100,
      opacity: 0.45,
    },
  },
  {
    size: 60,
    top: null,
    left: '22%',
    right: null,
    bottom: '18%',
    delay: 4.2,
    duration: 15,
    scale: 1.1,
    light: {
      color1: 'rgba(245, 158, 11, 0.35)',
      color2: 'rgba(252, 211, 77, 0.18)',
      color3: 'rgba(245, 158, 11, 0)',
      blur: 75,
      opacity: 0.85,
    },
    dark: {
      color1: 'rgba(245, 158, 11, 0.35)',
      color2: 'rgba(252, 211, 77, 0.18)',
      color3: 'rgba(245, 158, 11, 0)',
      blur: 80,
      opacity: 0.6,
    },
  },
]

const balls = computed(() => {
  return ballData.map((b) => {
    const themeParams = isDark.value ? b.dark : b.light
    return {
      ...b,
      ...themeParams,
      gradient: `radial-gradient(circle at 38% 32%, ${themeParams.color1} 0%, ${themeParams.color2} 55%, ${themeParams.color3} 100%)`,
    }
  })
})
</script>

<style lang="scss" scoped>
/* ============================================================
   四个独立的浮动路径（GPU 加速）
   ============================================================ */

@keyframes float1 {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  20% {
    transform: translate3d(50px, -70px, 0) scale(1.06);
  }
  40% {
    transform: translate3d(110px, -20px, 0) scale(0.96);
  }
  60% {
    transform: translate3d(90px, 60px, 0) scale(1.04);
  }
  80% {
    transform: translate3d(30px, 80px, 0) scale(0.98);
  }
}

@keyframes float2 {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  20% {
    transform: translate3d(-60px, -50px, 0) scale(0.94);
  }
  40% {
    transform: translate3d(-120px, 10px, 0) scale(1.08);
  }
  60% {
    transform: translate3d(-100px, 70px, 0) scale(0.96);
  }
  80% {
    transform: translate3d(-40px, 60px, 0) scale(1.02);
  }
}

@keyframes float3 {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  20% {
    transform: translate3d(40px, 80px, 0) scale(0.92);
  }
  40% {
    transform: translate3d(90px, 40px, 0) scale(1.1);
  }
  60% {
    transform: translate3d(70px, -60px, 0) scale(0.94);
  }
  80% {
    transform: translate3d(20px, -90px, 0) scale(1.06);
  }
}

@keyframes float4 {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  20% {
    transform: translate3d(-30px, -90px, 0) scale(1.08);
  }
  40% {
    transform: translate3d(-80px, -30px, 0) scale(0.9);
  }
  60% {
    transform: translate3d(-60px, 50px, 0) scale(1.04);
  }
  80% {
    transform: translate3d(-10px, 70px, 0) scale(0.96);
  }
}

.ball {
  /* 强制合成层，优化模糊滤镜渲染 */
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform, filter, opacity;

  /* 边缘柔和过渡，消除硬边 */
  &::after {
    content: '';
    position: absolute;
    inset: -10%;
    border-radius: 50%;
    background: inherit;
    filter: blur(20px);
    opacity: 0.3;
    pointer-events: none;
    will-change: transform;
  }
}
</style>
