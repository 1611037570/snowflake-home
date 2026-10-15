<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  level: number; // 已点亮的熟练度档位
  color: string; // 已点亮圆点颜色
}>();
// 五个圆点按当前档位点亮。
const segments = computed(() => Array.from({ length: 5 }, (_, index) => index < props.level));
</script>

<template>
  <span class="flex shrink-0 items-center gap-1" aria-hidden="true">
    <span
      v-for="(lit, index) in segments"
      :key="index"
      class="h-1.5 w-1.5 rounded-full transition-colors"
      :style="{ backgroundColor: lit ? color : 'currentColor', opacity: lit ? 1 : 0.6 }"
    />
  </span>
</template>
