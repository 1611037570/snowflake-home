<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 首页色带自行占位，固定文案不依赖简历数据。 -->
  <div class="flex h-9 w-full min-w-0 items-center bg-[#111C27] text-white">
    <span class="h-full w-12 shrink-0" :style="{ backgroundColor: themeColor }" />
    <span class="ml-3 text-sm font-bold tracking-[0.2em]">RESUME</span>
  </div>
</template>
