<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 短线和疏字标题共用一行，适用于双栏及独立标题主题。 -->
  <h2
    class="flex min-w-0 items-center gap-3 font-medium tracking-[0.3em] break-words"
    :style="{ color: themeColor }"
  >
    <span aria-hidden="true" class="h-px w-6 shrink-0 bg-current" />
    <TitleText :title="title" />
  </h2>
</template>
