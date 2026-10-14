<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块的显示标题
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 竖块对准正文区域左侧留白，标题留出固定间距避免贴边。 -->
  <div class="relative flex min-h-9 items-center pl-3">
    <span
      aria-hidden="true"
      class="pointer-events-none absolute h-9 w-[3px]"
      :style="{ left: 'calc(0px - var(--resume-region-inset-left, 0px))', backgroundColor: themeColor }"
    />
    <h2 class="min-w-0 font-bold tracking-wide break-words"><TitleText :title="title" /></h2>
  </div>
</template>
