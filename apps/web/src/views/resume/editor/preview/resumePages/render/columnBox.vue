<script setup lang="ts">
import { computed } from "vue";
import type { ColumnPadding } from "../engine/pageLayoutTypes";

const props = defineProps<{
  width?: number; // 栏外部占用宽度
  padding?: ColumnPadding; // 栏内部左右装饰空间
}>();

// 测量与预览共用同一个边框盒，装饰空间只在这里施加一次。
const boxStyle = computed(() => ({
  flex: props.width === undefined ? "1 1 0%" : `0 0 ${props.width}px`, // 栏占用宽度
  width: props.width === undefined ? undefined : `${props.width}px`, // 栏外部宽度
  paddingLeft: `${props.padding?.left ?? 0}px`, // 左侧装饰内边距
  paddingRight: `${props.padding?.right ?? 0}px`, // 右侧装饰内边距
}));
</script>

<template>
  <div class="relative box-border flex min-w-0 flex-col" :style="boxStyle"><slot /></div>
</template>
