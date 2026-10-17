<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor, themeColorLine } } = useResumePreviewContext();
</script>

<template>
  <!-- 宽字距标题与中性细线适用于完整主题和独立极简主题。 -->
  <h2
    class="min-w-0 border-b pb-3 font-extrabold tracking-[0.36em] uppercase break-words"
    :style="{ borderColor: themeColorLine, color: themeColor }"
  >
    <TitleText :title="title" />
  </h2>
</template>
