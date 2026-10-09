<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolvePageAppearance } from "./registry";

// 页面纹理由当前主题决定，未声明时按主题编号选择页面背景外观。
const { themeDecisions, ui } = useResumePreviewContext();
const appearance = computed(() => resolvePageAppearance(themeDecisions.value.pageBackgroundPattern || ui.value?.theme?.template));
</script>

<template>
  <!-- 页面外观层由页面自己派发，分页预览与长图导出共用同一份实现 -->
  <component :is="appearance" />
</template>

<style lang="scss" scoped></style>
