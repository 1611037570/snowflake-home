<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  level: number; // 一到十分的技能评分
  color: string; // 已点亮圆点颜色
}>();
// 五个圆点按十分制评分填充，每颗代表两分。
const segments = computed(() => Array.from({ length: 5 }, (_, index) =>
  Math.min(100, Math.max(0, (props.level - index * 2) * 50)),
));
</script>

<template>
  <span class="flex shrink-0 items-center gap-1" aria-hidden="true">
    <span
      v-for="(fill, index) in segments"
      :key="index"
      class="relative h-1.5 w-1.5 overflow-hidden rounded-full bg-sf-b"
    >
      <span class="absolute inset-y-0 left-0" :style="{ width: `${fill}%`, backgroundColor: color }" />
    </span>
  </span>
</template>
