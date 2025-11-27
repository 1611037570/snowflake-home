<template>
  <div
    class="fixed bottom-0 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center transition-all duration-300"
    :class="dockClass"
  >
    <div
      class="flex max-h-[60px] min-h-[60px] w-auto translate-z-0 items-end rounded-2xl bg-sf-transparent-2 p-2.5 transition-all duration-300"
      ref="menuRef"
      style="-webkit-backdrop-blur: 10px; backdrop-filter: blur(10px)"
      @mousemove="throttledMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <template v-for="(i, index) in list" :key="i.name">
        <div class="menu-item">
          <Component
            v-if="i.component"
            :is="i.component"
            class="cursor-pointer"
            :style="{ zoom: 'var(--i) !important' }"
          />
        </div>
        <div class="gap" v-if="index !== list.length - 1"></div>
      </template>
    </div>
  </div>
</template>
<script setup>
import { useEventListener, useThrottleFn, useWindowSize } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'

import { useHomeStore } from '@/stores'
import list from './dock.data'

// 原始样式相关状态保留
const init = ref(false)

// 核心常量
const SCALE_RANGE = 200
const MAX_SCALE = 1.55
const SCALE_DIFF = MAX_SCALE - 1
const HALF_RANGE = SCALE_RANGE / 2

// 状态管理
const menuRef = ref(null)
const homeStore = useHomeStore()
const { autoHideDock } = storeToRefs(homeStore)
const dockVisible = ref(false)
const { height: windowHeight } = useWindowSize()

// 原始dockClass计算逻辑保留
const dockClass = computed(() => {
  if (!init.value) return 'translate-y-[100px]'
  if (autoHideDock.value) {
    return dockVisible.value ? 'translate-y-[-20px]' : 'translate-y-[100px]'
  }
  return 'translate-y-[-20px]'
})

// DOM元素引用
let elements = []
const elementCache = shallowRef([])

// 初始化：获取元素列表并设置节流事件
onMounted(() => {
  init.value = true
  if (menuRef.value) {
    elements = Array.from(menuRef.value.querySelectorAll('.menu-item, .gap'))
    // 新增：初始化时缓存元素布局信息
    cacheElementLayout()
  }
})

// 新增：缓存元素布局信息（中心X坐标）
const cacheElementLayout = () => {
  if (!elements.length) return
  elementCache.value = elements.map((el) => {
    const rect = el.getBoundingClientRect()
    return {
      centerX: rect.x + rect.width / 2, // 缓存元素水平中心坐标
    }
  })
}

// 新增：监听窗口resize事件，节流更新布局缓存（窗口变化会导致元素位置改变）
const throttledResize = useThrottleFn(() => {
  cacheElementLayout()
}, 100) // 100ms节流间隔，平衡实时性和性能
useEventListener(window, 'resize', throttledResize)

// 使用useThrottleFn处理全局鼠标移动
const throttledWindowMouseMove = useThrottleFn((e) => {
  if (!autoHideDock.value) return
  dockVisible.value = windowHeight.value - e.clientY < 300
}, 30) // 30ms节流间隔

useEventListener(window, 'mousemove', throttledWindowMouseMove, {
  passive: true,
})

// 缩放计算
const getScale = (mouseX, index) => {
  const cache = elementCache.value[index]
  if (!cache) return 1

  const distance = Math.abs(mouseX - cache.centerX)

  if (distance >= HALF_RANGE) return 1

  // 优化：使用更高效的计算公式
  const ratio = (HALF_RANGE - distance) / HALF_RANGE
  return Math.sin((ratio * Math.PI) / 2) * SCALE_DIFF + 1
}
// 使用useThrottleFn处理dock内部鼠标移动（自动清理）
const throttledMouseMove = useThrottleFn((e) => {
  if (!elements.length || !elementCache.value.length) return
  requestAnimationFrame(() => {
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.setProperty('--i', getScale(e.clientX, i))
    }
  })
}, 16) // 约60fps间隔

// 鼠标离开重置
const handleMouseLeave = () => {
  requestAnimationFrame(() => {
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.setProperty('--i', 1)
    }
  })
}
</script>

<style scoped>
.menu-item {
  min-width: calc(var(--base-i) * 40px);
  min-height: calc(var(--base-i) * 40px);
  margin-bottom: calc(var(--base-i) * 15px - 15px);
  backface-visibility: hidden;
}

.gap {
  min-width: calc(var(--base-i) * 10px);
  min-height: 1px;
}
.menu-item,
.gap {
  --base-i: var(--i, 1);
  transform: translate3d(0, 0, 0);
  transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
