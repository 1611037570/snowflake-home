<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
// 柔彩晕染只绘制在纸张背景层，不改变页面几何或正文可读性。
const paperStyle = computed(() => ({
  backgroundImage: [
    `radial-gradient(ellipse 52% 24% at 100% 0%, color-mix(in srgb, ${themeColor.value} 23%, transparent), transparent 76%)`,
    "radial-gradient(ellipse 42% 28% at 0% 88%, rgba(171, 198, 223, 0.28), transparent 78%)",
    "radial-gradient(ellipse 34% 16% at 56% 58%, rgba(245, 218, 169, 0.12), transparent 80%)",
  ].join(", "),
}));
</script>

<template>
  <!-- 透明渐变叠在纸张底色之上，测量与预览共用同一背景层。 -->
  <div aria-hidden="true" class="resume-page-pattern pointer-events-none absolute inset-0 -z-10" :style="paperStyle" />
</template>
