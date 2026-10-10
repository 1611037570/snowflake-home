<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 首页顶带自行占位，不绘制纹理或依赖用户标语数据。 -->
  <div class="teal-card-band h-3 w-full shrink-0" :style="{ backgroundColor: themeColor }" aria-hidden="true" />
</template>
