<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 首页顶部蓝线在中部折角后收窄。 -->
  <div class="relative h-[30px] w-full min-w-0" aria-hidden="true">
    <div class="absolute inset-0" :style="{ backgroundColor: themeColor, clipPath: 'polygon(0 0, 100% 0, 100% 40%, 58% 40%, 56% 100%, 0 100%)' }" />
  </div>
</template>
