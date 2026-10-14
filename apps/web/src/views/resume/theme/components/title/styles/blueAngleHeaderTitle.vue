<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 模块标题文字
});
const { theme: { themeColor, themeColorContrast } } = useResumePreviewContext();
</script>

<template>
  <!-- 细线与标题签底部重叠，避免边框占位形成空隙。 -->
  <div class="relative flex min-w-0 items-end">
    <span class="absolute inset-x-0 bottom-0 h-[2px]" :style="{ backgroundColor: themeColor }" aria-hidden="true" />
    <h2 class="blue-angle-title flex min-h-[42px] max-w-[60%] items-center px-3 pr-6 font-bold" :style="{ backgroundColor: themeColor, color: themeColorContrast }">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style scoped>
/* 右端斜切保留标题节点的实际占位宽度。 */
.blue-angle-title { clip-path: polygon(0 0, calc(100% - 21px) 0, 100% 100%, 0 100%); }
</style>
