<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 浅色方格只提供纸张肌理，不与正文争夺视觉层级。
const gridCellSize = 24;
const {
  theme: { themeColor },
} = useResumePreviewContext();
// 格线跟随主题色，低透明度使文字保持清晰。
const gridLineColor = computed(() => `${themeColor.value}14`);
const gridImage = computed(
  () =>
    `linear-gradient(to right, ${gridLineColor.value} 1px, transparent 1px), linear-gradient(to bottom, ${gridLineColor.value} 1px, transparent 1px)`,
);
</script>

<template>
  <!-- 负层级让方格纹理压在纸张底色之上、正文之下，绝对定位不参与布局 -->
  <div
    aria-hidden="true"
    class="resume-page-pattern pointer-events-none absolute inset-0 -z-10"
    :style="{ backgroundImage: gridImage, backgroundSize: `${gridCellSize}px ${gridCellSize}px` }"
  />
</template>
