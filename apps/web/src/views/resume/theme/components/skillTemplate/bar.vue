<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  level: number; // 一到十分的技能评分
  color: string; // 已点亮横条颜色
  fluid?: boolean; // 横条是否撑满所在列
}>();
// 五段进度条按十分制评分填充，每段代表两分。
const segments = computed(() => Array.from({ length: 5 }, (_, index) =>
  Math.min(100, Math.max(0, (props.level - index * 2) * 50)),
));
</script>

<template>
  <span class="flex items-center gap-1" :class="fluid ? 'w-full' : 'shrink-0'" aria-hidden="true">
    <span
      v-for="(fill, index) in segments"
      :key="index"
      class="relative h-1.5 overflow-hidden rounded-full bg-sf-b"
      :class="fluid ? 'min-w-0 flex-1' : 'w-6'"
    >
      <span class="absolute inset-y-0 left-0 rounded-full" :style="{ width: `${fill}%`, backgroundColor: color }" />
    </span>
  </span>
</template>
