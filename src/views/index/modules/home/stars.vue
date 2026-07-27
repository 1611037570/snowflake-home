<template>
  <!-- 星星粒子层（支持消失/重现） -->
  <div class="pointer-events-none absolute inset-0 z-0" :style="starContainerStyle">
    <transition-group name="star-fade" tag="div" class="stars-wrapper">
      <span
        class="star"
        v-for="star in displayedStars"
        :key="`star-${star.id}`"
        v-show="star.alive"
        :style="star.style"
      ></span>
    </transition-group>
  </div>
</template>

<script setup>
import { darkThemeColors } from '@/constants'
import { useThemeStore } from '@/stores' // 新增：引入主题
import { useSystemStore } from '@/stores/modules/system'
import { useEventListener, useIntervalFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'

const systemStore = useSystemStore()
const themeStore = useThemeStore()
const { performanceMode } = storeToRefs(systemStore)
const { isDark } = storeToRefs(themeStore) // 响应式主题

const stars = ref([])

// 根据性能模式动态计算需要渲染的星星
const displayedStars = computed(() => {
  return performanceMode.value ? stars.value.slice(0, STAR_CONFIG.centerCount) : stars.value
})

// ================= 常量配置区 =================

const TILT_CONFIG = {
  rotateX: 10,
  rotateY: 10,
  translateX: 120,
  translateY: 120,
}

const STAR_CONFIG = {
  centerCount: 120,
  edgeCount: 50,
  minLife: 2,
  maxLife: 5,
}

const maxRotate = Math.max(TILT_CONFIG.rotateX, TILT_CONFIG.rotateY)
const maxTranslate = Math.max(TILT_CONFIG.translateX, TILT_CONFIG.translateY)
const dynamicEdgeOffset = Math.ceil(maxRotate + (maxTranslate / 800) * 100) + 5

// ===========================================

// 星星容器 3D 变换样式
const starContainerStyle = ref({
  perspective: '800px',
  transformStyle: 'preserve-3d',
  transform: 'rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px)',
  transition: 'transform 0.1s ease-out',
})

// ---------- 鼠标移动驱动 3D ----------
let rafId = null
const handleMouseMove = (e) => {
  if (performanceMode.value) return
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = (e.clientY / window.innerHeight) * 2 - 1
    const rotateX = -y * TILT_CONFIG.rotateX
    const rotateY = x * TILT_CONFIG.rotateY
    const translateX = x * TILT_CONFIG.translateX
    const translateY = y * TILT_CONFIG.translateY
    starContainerStyle.value.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateX(${translateX}px)
      translateY(${translateY}px)
    `
    rafId = null
  })
}

// ---------- 主题相关颜色配置 ----------
const getCurrentColors = () => darkThemeColors.map((c) => c.value)

// ---------- 辅助：基于 id 的伪随机数生成 ----------
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// ---------- 构建星星样式（根据主题） ----------
function buildStarStyle(color, shadowSize, opacityBase, darkMode) {
  if (darkMode) {
    // 深色模式：发光效果
    return {
      backgroundColor: color,
      boxShadow: `0 0 ${shadowSize}px ${color}`,
      opacity: opacityBase, // 0.3~0.8
    }
  } else {
    // 浅色模式：深色阴影 + 微弱彩色光晕，提高对比度
    return {
      backgroundColor: color,
      boxShadow: `0 0 ${shadowSize}px rgba(0,0,0,0.35), 0 0 1px ${color}`,
      opacity: Math.min(opacityBase + 0.2, 1), // 提升最低透明度至 0.5~1.0
    }
  }
}

// ---------- 生成单颗星星数据（包含完整样式） ----------
function createStar(id) {
  const colors = getCurrentColors()
  const colorIndex = Math.floor(seededRandom(id + 3) * colors.length)
  const color = colors[colorIndex]
  const size = seededRandom(id + 4) * 5 + 2.5

  // 位置计算（保持不变）
  let leftMin, leftMax, topMin, topMax
  const { centerCount, edgeCount } = STAR_CONFIG
  const edgeOffset = dynamicEdgeOffset

  if (id < centerCount) {
    leftMin = 0
    leftMax = 100
    topMin = 0
    topMax = 100
  } else if (id < centerCount + edgeCount) {
    leftMin = -edgeOffset
    leftMax = 100 + edgeOffset
    topMin = -edgeOffset
    topMax = 0
  } else if (id < centerCount + edgeCount * 2) {
    leftMin = -edgeOffset
    leftMax = 100 + edgeOffset
    topMin = 100
    topMax = 100 + edgeOffset
  } else if (id < centerCount + edgeCount * 3) {
    leftMin = -edgeOffset
    leftMax = 0
    topMin = 0
    topMax = 100
  } else {
    leftMin = 100
    leftMax = 100 + edgeOffset
    topMin = 0
    topMax = 100
  }
  const left = seededRandom(id + 5) * (leftMax - leftMin) + leftMin
  const top = seededRandom(id + 6) * (topMax - topMin) + topMin

  const shadowSize = Math.floor(seededRandom(id + 7) * 6) + 2
  const opacityBase = seededRandom(id + 8) * 0.5 + 0.3
  const twinkleDelay = seededRandom(id + 9) * 6
  const twinkleDuration = seededRandom(id + 10) * 4 + 2

  // 构建完整样式对象（包含位置、大小、动画和颜色）
  const style = {
    left: left + '%',
    top: top + '%',
    width: size + 'px',
    height: size + 'px',
    animationDelay: twinkleDelay + 's',
    animationDuration: twinkleDuration + 's',
    ...buildStarStyle(color, shadowSize, opacityBase, isDark.value),
  }

  return {
    id,
    alive: true,
    life: seededRandom(id + 11) * (STAR_CONFIG.maxLife - STAR_CONFIG.minLife) + STAR_CONFIG.minLife,
    // 存储固定参数，便于主题切换
    _colorIndex: colorIndex,
    _shadowSize: shadowSize,
    _opacityBase: opacityBase,
    style: style,
  }
}

// ---------- 更新所有星星的主题样式（仅更新颜色相关，保留位置/大小/动画） ----------
function updateStarsTheme() {
  const colors = getCurrentColors()
  stars.value.forEach((star) => {
    const color = colors[star._colorIndex % colors.length]
    const newStyle = buildStarStyle(color, star._shadowSize, star._opacityBase, isDark.value)
    // 仅更新颜色、阴影、透明度，保留其他属性
    star.style.backgroundColor = newStyle.backgroundColor
    star.style.boxShadow = newStyle.boxShadow
    star.style.opacity = newStyle.opacity
  })
}

// ---------- 生成或重置星星数组 ----------
function generateStars() {
  const totalCount = STAR_CONFIG.centerCount + STAR_CONFIG.edgeCount * 4
  stars.value = Array.from({ length: totalCount }, (_, index) => createStar(index))
}

// ---------- 星星生命周期更新 ----------
function updateStarsLife() {
  for (let i = 0; i < stars.value.length; i++) {
    const star = stars.value[i]
    star.life -= 0.1
    if (star.life <= 0) {
      star.alive = !star.alive
      star.life = Math.random() * (STAR_CONFIG.maxLife - STAR_CONFIG.minLife) + STAR_CONFIG.minLife
    }
  }
}

// ---------- 初始化 & 监听 ----------
onMounted(() => {
  generateStars()
})

// 启动星星生命周期定时器（每 100ms）
const { pause, resume } = useIntervalFn(updateStarsLife, 100)

// 监听性能模式
watch(
  performanceMode,
  (isPerformance) => {
    if (isPerformance) {
      pause()
      const limit = Math.min(stars.value.length, STAR_CONFIG.centerCount)
      for (let i = 0; i < limit; i++) {
        stars.value[i].alive = true
      }
      starContainerStyle.value.transform =
        'rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px)'
    } else {
      resume()
    }
  },
  { immediate: true },
)

// 监听主题变化，更新星星样式（不重置生命周期）
watch(isDark, () => {
  updateStarsTheme()
})

// 鼠标监听
useEventListener('mousemove', handleMouseMove)
</script>

<style scoped>
/* ===== 星星粒子 ===== */
.stars-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.star {
  position: absolute;
  border-radius: 50%;
  animation: starTwinkle ease-in-out infinite alternate;
  transition:
    opacity 0.5s ease,
    background-color 0.5s ease,
    box-shadow 0.5s ease; /* 平滑过渡主题切换 */
}
@keyframes starTwinkle {
  0% {
    transform: scale(0.6);
  }
  100% {
    transform: scale(1.4);
  }
}

/* ===== 星星消失/重现过渡动画 ===== */
.star-fade-enter-active,
.star-fade-leave-active {
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}
.star-fade-enter-from,
.star-fade-leave-to {
  opacity: 0;
  transform: scale(0.2);
}
</style>
