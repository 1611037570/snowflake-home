<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 模块显示标题
});
const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 短下划线由标题自身绘制，左右栏共用同一标题组件。 -->
  <h2 class="sand-title relative min-w-0 pb-3 font-medium tracking-[0.18em] break-words" :style="{ color: themeColor }">
    <TitleText :title="title" />
  </h2>
</template>

<style scoped>
.sand-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 84px;
  max-width: 100%;
  height: 1px;
  background-color: currentColor;
  pointer-events: none;
}
</style>
