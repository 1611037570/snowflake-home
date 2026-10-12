<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor, themeColorLine } } = useResumePreviewContext();
</script>

<template>
  <!-- 标题内边距属于标题节点，卡片外框不增加公共布局预算。 -->
  <div class="flex min-w-0 items-center gap-3 px-6 pt-6 pb-3" :style="{ color: themeColor }">
    <h2 class="min-w-0 shrink-0 font-semibold tracking-[0.08em] break-words"><TitleText :title="title" /></h2>
    <span aria-hidden="true" class="h-px min-w-0 flex-1" :style="{ backgroundColor: themeColorLine }" />
  </div>
</template>
