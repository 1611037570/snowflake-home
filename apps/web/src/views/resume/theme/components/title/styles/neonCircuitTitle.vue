<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor, themeColorSoft } } = useResumePreviewContext();
</script>

<template>
  <!-- 标题光带收在栏宽内，避免参考图中横向越界。 -->
  <div
    class="min-w-0 border-l-[3px] py-3 pl-3"
    :style="{
      borderColor: themeColor,
      color: themeColor,
      background: `linear-gradient(90deg, ${themeColorSoft}, transparent)`,
    }"
  >
    <h2 class="flex min-w-0 items-center break-words">
      <span class="mr-3">//</span><TitleText :title="title" />
    </h2>
  </div>
</template>
