<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 模块显示标题
});
const { theme: { themeColor, themeColorLine } } = useResumePreviewContext();
</script>

<template>
  <!-- 色块标题延续红色底板，细线连接右侧正文宽度。 -->
  <div class="flex items-end border-b" :style="{ borderColor: themeColorLine }">
    <h2 class="rounded-t-xl px-3 py-3 font-bold text-white" :style="{ backgroundColor: themeColor }">
      <TitleText :title="title" />
    </h2>
  </div>
</template>
