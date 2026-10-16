<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  variant: "semiRing" | "donut" | "openRing"; // 圆环展示样式
  level: number; // 一到十分的技能评分
  color: string; // 当前上下文的主题色
  name?: string; // 圆环中心显示的技能名称
}>();

// 圆环把十分制评分换算为绘制长度，数据仍只保存评分。
const progress = computed(() => Number.isFinite(props.level) ? Math.min(100, Math.max(0, props.level * 10)) : 70);
const progressLabel = computed(() => `${Number(progress.value.toFixed(1))}%`);
</script>

<template>
  <!-- 半圆环的技能名称放在图形下方。 -->
  <span v-if="variant === 'semiRing'" class="inline-flex shrink-0 flex-col items-center" :aria-label="`${name || ''} ${progressLabel}`">
    <svg width="96" height="54" viewBox="0 0 100 56" fill="none" aria-hidden="true">
      <path d="M 10 50 A 40 40 0 0 1 90 50" pathLength="100" stroke="currentColor" stroke-width="10" opacity="0.12" />
      <path d="M 10 50 A 40 40 0 0 1 90 50" pathLength="100" :stroke="color" stroke-width="10" :stroke-dasharray="`${progress} 100`" />
    </svg>
    <span class="max-w-36 text-center font-bold break-words">{{ name }}</span>
  </span>
  <span v-else class="inline-flex shrink-0 flex-col items-center" :aria-label="`${name || ''} ${progressLabel}`">
    <span class="relative inline-flex items-center justify-center">
      <svg width="84" height="84" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle v-if="variant === 'donut'" cx="50" cy="50" r="40" stroke="currentColor" stroke-width="10" opacity="0.12" />
        <circle
          cx="50" cy="50" r="40" pathLength="100" :stroke="color"
          :stroke-width="variant === 'donut' ? 10 : 4"
          :stroke-dasharray="`${progress} 100`"
          :transform="variant === 'donut' ? 'rotate(-90 50 50)' : 'rotate(-110 50 50)'"
          fill="none"
          :stroke-linecap="variant === 'openRing' ? 'round' : 'butt'"
        />
      </svg>
      <span class="absolute truncate text-center text-xs font-bold" style="max-width: 56px">{{ name }}</span>
    </span>
    <span v-if="variant === 'openRing'" class="font-medium">{{ progressLabel }}</span>
  </span>
</template>
