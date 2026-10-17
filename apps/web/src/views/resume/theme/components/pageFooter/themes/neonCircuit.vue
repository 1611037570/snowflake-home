<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 深色纸张上的页码跟随当前主题色。 -->
  <span :style="{ color: themeColor }"><slot /></span>
</template>
