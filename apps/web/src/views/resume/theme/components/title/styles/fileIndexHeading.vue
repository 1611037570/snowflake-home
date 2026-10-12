<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor, themeColorLine } } = useResumePreviewContext();
</script>

<template>
  <!-- 文字与序号分置索引线两侧，细线收束标题而不重复绘制图标。 -->
  <div class="flex min-w-0 items-center gap-3 pb-3">
    <h2 class="min-w-0 shrink-0 font-semibold tracking-[0.12em]" :style="{ color: themeColor }"><TitleText :title="title" /></h2>
    <span aria-hidden="true" class="h-px min-w-0 flex-1" :style="{ backgroundColor: themeColorLine }" />
  </div>
</template>
