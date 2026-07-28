<template>
  <!-- 星星粒子层（支持消失/重现） -->
  <div
    class="pointer-events-none absolute inset-0 z-0"
    ref="starContainerRef"
    style="
      perspective: 800px;
      transform-style: preserve-3d;
      transition: transform 0.1s ease-out;
      transform: rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px);
    "
  >
    <div class="stars-wrapper">
      <!-- 普通星星循环 -->
      <span
        class="star"
        v-for="star in displayedStars"
        :key="`star-${star.id}`"
        :style="star.style"
        :class="{ hidden: !star.alive }"
      ></span>

      <!-- ========= 巨蟹座星座（永不消失，左上角，可调位置） ========= -->
      <CancerConstellation style="transform: scale(0.8); left: 5%; top: 5%" />
    </div>
  </div>
</template>

<script setup>
import { darkThemeColors } from '@/constants'
import { useThemeStore } from '@/stores'
import { useSystemStore } from '@/stores/modules/system'
import { useEventListener, useIntervalFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, markRaw, onMounted, ref, watch } from 'vue'
import CancerConstellation from './CancerConstellation.vue'
const systemStore = useSystemStore()
const themeStore = useThemeStore()
const { performanceMode } = storeToRefs(systemStore)
const { isDark } = storeToRefs(themeStore)

// ================= 常量配置区 =================
const TILT_CONFIG = {
  rotateX: 5,
  rotateY: 5,
  translateX: 200,
  translateY: 260,
}

const STAR_CONFIG = {
  centerCount: 200,
  edgeCount: 100,
  minLife: 2,
  maxLife: 5,
}

const TOTAL_STARS = STAR_CONFIG.centerCount + STAR_CONFIG.edgeCount * 4

const maxRotate = Math.max(TILT_CONFIG.rotateX, TILT_CONFIG.rotateY)
const maxTranslate = Math.max(TILT_CONFIG.translateX, TILT_CONFIG.translateY)
const dynamicEdgeOffset = Math.ceil(maxRotate + (maxTranslate / 800) * 100) + 5

// ================= 原有星星逻辑（保持不变） =================
const stars = ref([])
const starLifeArray = new Float32Array(TOTAL_STARS)
const starContainerRef = ref(null)
let rafId = null

const displayedStars = computed(() => {
  if (performanceMode.value) {
    return stars.value.slice(0, STAR_CONFIG.centerCount)
  }
  return stars.value
})

const currentColors = darkThemeColors.map((c) => c.value)

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function buildStarStyle(color, shadowSize, opacityBase, darkMode) {
  let style
  if (darkMode) {
    style = {
      backgroundColor: color,
      boxShadow: `0 0 ${shadowSize}px ${color}`,
      opacity: opacityBase,
    }
  } else {
    style = {
      backgroundColor: color,
      boxShadow: `0 0 ${shadowSize}px rgba(0,0,0,0.35), 0 0 1px ${color}`,
      opacity: Math.min(opacityBase + 0.2, 1),
    }
  }
  return markRaw(style)
}

function getZoneBounds(zone, quadrant = 0) {
  const edgeOffset = dynamicEdgeOffset
  switch (zone) {
    case 0: {
      const half = 50
      let leftMin, leftMax, topMin, topMax
      switch (quadrant) {
        case 0:
          leftMin = 0
          leftMax = half
          topMin = 0
          topMax = half
          break
        case 1:
          leftMin = half
          leftMax = 100
          topMin = 0
          topMax = half
          break
        case 2:
          leftMin = 0
          leftMax = half
          topMin = half
          topMax = 100
          break
        case 3:
          leftMin = half
          leftMax = 100
          topMin = half
          topMax = 100
          break
        default:
          leftMin = 0
          leftMax = 100
          topMin = 0
          topMax = 100
      }
      return { leftMin, leftMax, topMin, topMax }
    }
    case 1:
      return { leftMin: -edgeOffset, leftMax: 100 + edgeOffset, topMin: -edgeOffset, topMax: 0 }
    case 2:
      return {
        leftMin: -edgeOffset,
        leftMax: 100 + edgeOffset,
        topMin: 100,
        topMax: 100 + edgeOffset,
      }
    case 3:
      return { leftMin: -edgeOffset, leftMax: 0, topMin: 0, topMax: 100 }
    case 4:
      return { leftMin: 100, leftMax: 100 + edgeOffset, topMin: 0, topMax: 100 }
  }
}

function generateStarProps(id = null) {
  const isInitial = id !== null
  const random = isInitial ? (offset) => seededRandom(id + offset) : () => Math.random()
  const colors = currentColors
  const colorIndex = Math.floor(random(3) * colors.length)
  const color = colors[colorIndex]
  const size = random(4) * 5 + 2.5

  let zone
  if (isInitial) {
    const { centerCount, edgeCount } = STAR_CONFIG
    if (id < centerCount) zone = 0
    else if (id < centerCount + edgeCount) zone = 1
    else if (id < centerCount + edgeCount * 2) zone = 2
    else if (id < centerCount + edgeCount * 3) zone = 3
    else zone = 4
  } else {
    zone = Math.floor(random(0) * 5)
  }

  let quadrant = 0
  if (zone === 0) {
    if (isInitial) {
      const idxInCenter = id % STAR_CONFIG.centerCount
      quadrant = Math.floor((idxInCenter / STAR_CONFIG.centerCount) * 4)
    } else {
      quadrant = Math.floor(random(11) * 4)
    }
  }

  const { leftMin, leftMax, topMin, topMax } = getZoneBounds(zone, quadrant)
  const left = random(5) * (leftMax - leftMin) + leftMin
  const top = random(6) * (topMax - topMin) + topMin
  const shadowSize = Math.floor(random(7) * 6) + 2
  const opacityBase = random(8) * 0.5 + 0.3
  const twinkleDelay = random(9) * 6
  const twinkleDuration = random(10) * 4 + 2

  const style = {
    left: left + '%',
    top: top + '%',
    width: size + 'px',
    height: size + 'px',
    animationDelay: twinkleDelay + 's',
    animationDuration: twinkleDuration + 's',
    ...buildStarStyle(color, shadowSize, opacityBase, isDark.value),
  }

  return { colorIndex, shadowSize, opacityBase, style }
}

function createStar(id) {
  const props = generateStarProps(id)
  starLifeArray[id] =
    seededRandom(id + 11) * (STAR_CONFIG.maxLife - STAR_CONFIG.minLife) + STAR_CONFIG.minLife
  return {
    id,
    alive: true,
    _colorIndex: props.colorIndex,
    _shadowSize: props.shadowSize,
    _opacityBase: props.opacityBase,
    style: props.style,
  }
}

function regenerateStar(star) {
  const props = generateStarProps()
  star.style = props.style
  star._colorIndex = props.colorIndex
  star._shadowSize = props.shadowSize
  star._opacityBase = props.opacityBase
}

function updateStarsLife() {
  const starsVal = stars.value
  const { maxLife, minLife } = STAR_CONFIG
  for (let i = 0; i < starsVal.length; i++) {
    if (isNaN(starLifeArray[i]) || !isFinite(starLifeArray[i])) {
      starLifeArray[i] = Math.random() * (maxLife - minLife) + minLife
      starsVal[i].alive = true
      continue
    }
    starLifeArray[i] -= 0.1
    if (starLifeArray[i] <= 0) {
      const star = starsVal[i]
      const wasAlive = star.alive
      star.alive = !wasAlive
      if (!wasAlive) {
        regenerateStar(star)
      }
      starLifeArray[i] = Math.random() * (maxLife - minLife) + minLife
    }
  }
}

function updateStarsTheme() {
  const colors = currentColors
  const dark = isDark.value
  stars.value.forEach((star) => {
    const color = colors[star._colorIndex % colors.length]
    const newStyle = buildStarStyle(color, star._shadowSize, star._opacityBase, dark)
    star.style = newStyle
  })
}

function generateStars() {
  stars.value = Array.from({ length: TOTAL_STARS }, (_, index) => createStar(index))
}

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
    if (starContainerRef.value) {
      starContainerRef.value.style.transform = `
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateX(${translateX}px)
        translateY(${translateY}px)
      `
    }
    rafId = null
  })
}

onMounted(() => {
  generateStars()
})

const { pause, resume } = useIntervalFn(updateStarsLife, 100)

watch(
  performanceMode,
  (isPerformance) => {
    if (isPerformance) {
      pause()
      const limit = Math.min(stars.value.length, STAR_CONFIG.centerCount)
      for (let i = 0; i < limit; i++) {
        stars.value[i].alive = true
      }
      if (starContainerRef.value) {
        starContainerRef.value.style.transform =
          'rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px)'
      }
    } else {
      resume()
    }
  },
  { immediate: true },
)

watch(isDark, () => {
  updateStarsTheme()
})

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
    opacity 0.6s ease,
    transform 0.6s ease,
    background-color 0.5s ease,
    box-shadow 0.5s ease;
}

.star.hidden {
  opacity: 0;
  transform: scale(0.2);
}

@keyframes starTwinkle {
  0% {
    transform: scale(0.6);
  }
  100% {
    transform: scale(1.4);
  }
}

/* ===== 巨蟹座星座样式 ===== */
</style>
