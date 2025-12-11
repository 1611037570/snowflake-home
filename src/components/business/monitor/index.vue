<script setup>
// 监控面板：采集 FPS、内存、FCP、LCP、JS 脚本耗时
// 导入
import { useDraggable, useFps, useMemory, usePerformanceObserver } from '@vueuse/core'
import { computed, ref, useTemplateRef } from 'vue'

const fps = useFps({ interval: 500 })
const { memory, isSupported } = useMemory({ interval: 1000 })
const usedMB = computed(() => {
  const m = memory.value
  if (!m) return 0
  return m.usedJSHeapSize / 1024 / 1024
})
const remainingMB = computed(() => {
  const m = memory.value
  if (!m) return 0
  const remaining = (m.jsHeapSizeLimit - m.usedJSHeapSize) / 1024 / 1024
  return remaining
})
const monitor = useTemplateRef('monitor')
const { style } = useDraggable(monitor, { initialValue: { x: 40, y: 40 } })

const fcp = ref(null)
const lcp = ref(null)
const jsLoadTotal = ref(0)

// 推荐阈值（可按需调整）
const RECOMMEND_FPS = 60
const RECOMMEND_USED_MB = 300
const RECOMMEND_REMAINING_MB = 0
const RECOMMEND_FCP_MS = 1800
const RECOMMEND_LCP_MS = 2500
const RECOMMEND_JS_MS = 1500

// 达标判定
const fpsPass = computed(() => fps.value >= RECOMMEND_FPS)
const usedMBPass = computed(() => usedMB.value <= RECOMMEND_USED_MB)
const remainingMBPass = computed(() => remainingMB.value > RECOMMEND_REMAINING_MB)
const fcpPass = computed(() => fcp.value != null && fcp.value <= RECOMMEND_FCP_MS)
const lcpPass = computed(() => lcp.value != null && lcp.value <= RECOMMEND_LCP_MS)
const jsPass = computed(() => jsLoadTotal.value <= RECOMMEND_JS_MS)

// 性能观察器封装（buffered 读取历史记录）
const observe = (type, cb) => usePerformanceObserver({ type, buffered: true }, cb) // type：条目类型；buffered：读取历史

observe('paint', (list) => {
  // FCP
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint' && fcp.value == null)
      fcp.value = entry.startTime
  }
})

observe('largest-contentful-paint', (list) => {
  // LCP
  for (const entry of list.getEntries()) {
    lcp.value = entry.startTime
  }
})

observe('resource', (list) => {
  // JS 脚本资源
  for (const entry of list.getEntries()) {
    const e = entry
    if (e.initiatorType === 'script' && e.duration > 0) jsLoadTotal.value += e.duration
  }
})
</script>

<template>
  <!-- 指标展示：三列网格对齐（名称 / 当前值 / 推荐） -->
  <div
    :style="style"
    class="fixed top-0 right-0 z-9999 rounded-xl bg-sf-theme/90 p-3 text-sf-theme-text shadow-xl ring-1 ring-sf-theme-text/10 backdrop-blur-sm transition-all duration-200 hover:bg-sf-theme"
    ref="monitor"
  >
    <div class="grid grid-cols-[6rem_6rem_6rem] items-center gap-2 hover:text-sf-theme-text">
      <span>fps</span>
      <span :class="fpsPass ? '' : 'text-sf-error'">{{ fps }}</span>
      <span
        class="rounded px-2 py-0.5 text-xs whitespace-nowrap opacity-70 hover:opacity-100"
        :class="fpsPass ? '' : 'text-sf-error'"
        >推荐≥{{ RECOMMEND_FPS }}</span
      >
    </div>
    <template v-if="isSupported && memory">
      <div class="grid grid-cols-[8rem_12rem_16rem] items-center gap-2 hover:text-sf-theme-text">
        <span>已用内存</span>
        <span :class="usedMBPass ? '' : 'text-sf-warning'">{{ usedMB.toFixed(2) }}MB</span>
        <span
          class="rounded px-2 py-0.5 text-xs whitespace-nowrap opacity-70 hover:opacity-100"
          :class="usedMBPass ? '' : 'text-sf-warning'"
          >推荐≤{{ RECOMMEND_USED_MB }}MB</span
        >
      </div>
      <div class="grid grid-cols-[8rem_12rem_16rem] items-center gap-2 hover:text-sf-theme-text">
        <span>剩余内存</span>
        <span :class="remainingMBPass ? '' : 'text-sf-error'">{{ remainingMB.toFixed(2) }}MB</span>
        <span
          class="rounded px-2 py-0.5 text-xs whitespace-nowrap opacity-70 hover:opacity-100"
          :class="remainingMBPass ? '' : 'text-sf-error'"
          >推荐＞{{ RECOMMEND_REMAINING_MB }}MB</span
        >
      </div>
    </template>
    <div class="grid grid-cols-[6rem_6rem_6rem] items-center gap-2 hover:text-sf-theme-text">
      <span>FCP</span>
      <span :class="fcpPass ? '' : 'text-sf-error'">{{
        fcp == null ? '—' : `${Math.round(fcp)}ms`
      }}</span>
      <span
        class="rounded px-2 py-0.5 text-xs whitespace-nowrap opacity-70 hover:opacity-100"
        :class="fcpPass ? '' : 'text-sf-error'"
        >推荐≤{{ RECOMMEND_FCP_MS }}ms</span
      >
    </div>
    <div class="grid grid-cols-[6rem_6rem_6rem] items-center gap-2 hover:text-sf-theme-text">
      <span>LCP</span>
      <span :class="lcpPass ? '' : 'text-sf-error'">{{
        lcp == null ? '—' : `${Math.round(lcp)}ms`
      }}</span>
      <span
        class="rounded px-2 py-0.5 text-xs whitespace-nowrap opacity-70 hover:opacity-100"
        :class="lcpPass ? '' : 'text-sf-error'"
        >推荐≤{{ RECOMMEND_LCP_MS }}ms</span
      >
    </div>
    <div class="grid grid-cols-[6rem_6rem_6rem] items-center gap-2 hover:text-sf-theme-text">
      <span>JS加载耗时(总)</span>
      <span :class="jsPass ? '' : 'text-sf-warning'">{{ Math.round(jsLoadTotal) }}ms</span>
      <span
        class="rounded px-2 py-0.5 text-xs whitespace-nowrap opacity-70 hover:opacity-100"
        :class="jsPass ? '' : 'text-sf-warning'"
        >推荐≤{{ RECOMMEND_JS_MS }}ms</span
      >
    </div>
  </div>
</template>
