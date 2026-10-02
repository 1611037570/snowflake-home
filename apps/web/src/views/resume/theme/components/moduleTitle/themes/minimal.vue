<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
// 标题底线取主题色的透明派生色，避免出现实色色块
const {
  theme: { themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 简约风格：纯标题文字，只有一条极细底线与字距 -->
  <h2
    class="minimal-title relative max-w-full min-w-0 pb-3 font-bold tracking-[0.08em] break-words"
    :style="{ '--minimal-title-line': themeColorLine }"
  >
    <TitleText :title="title" />
  </h2>
</template>

<style scoped>
/* 极细底线通栏落在标题下沿，绝对定位不增加标题的测量高度 */
.minimal-title::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background-color: color-mix(in srgb, var(--minimal-title-line) 50%, transparent);
  pointer-events: none;
}
</style>
