<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块的标题文字
});
const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 短粗线点缀标题，减少通栏横线带来的表格感。 -->
  <h2 class="ink-magazine-title relative min-w-0 pb-3 font-bold tracking-[0.06em] break-words" :style="{ color: themeColor }">
    <TitleText :title="title" />
  </h2>
</template>

<style scoped>
.ink-magazine-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 30px;
  max-width: 100%;
  height: 3px;
  background: currentColor;
  pointer-events: none;
}
</style>
