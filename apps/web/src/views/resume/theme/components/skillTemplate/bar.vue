<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  level: number; // 已点亮的熟练度档位
  color: string; // 已点亮横条颜色
  fluid?: boolean; // 横条是否撑满所在列
}>();
// 五段进度条按当前档位点亮。
const segments = computed(() => Array.from({ length: 5 }, (_, index) => index < props.level));
</script>

<template>
  <span class="flex items-center gap-1" :class="fluid ? 'w-full' : 'shrink-0'" aria-hidden="true">
    <span
      v-for="(lit, index) in segments"
      :key="index"
      class="h-1.5 rounded-full transition-colors"
      :class="fluid ? 'min-w-0 flex-1' : 'w-6'"
      :style="{ backgroundColor: lit ? color : 'currentColor', opacity: lit ? 1 : 0.6 }"
    />
  </span>
</template>
