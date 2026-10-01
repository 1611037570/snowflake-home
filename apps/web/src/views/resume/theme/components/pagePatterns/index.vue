<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolvePagePattern } from "./registry";

// 页面纹理由 ui.page.backgroundPattern 指定，未配置时走 default 组件（不绘制图案）
const { ui } = useResumePreviewContext();
const pattern = computed(() => resolvePagePattern(ui.value?.page?.backgroundPattern));
</script>

<template>
  <!-- 纹理层由页面自己派发，分页预览与长图导出共用同一份实现 -->
  <component :is="pattern" />
</template>

<style lang="scss" scoped></style>
