<script>
// 整页渐变覆盖纸张底色，背景设置保留展示但禁止调整。
const unsupportedSettings = {
  "page.background": "themeFixedPageBackground", // 页面背景由主题渐变固定绘制
};
export default { unsupportedSettings };
</script>

<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 背景覆盖整张纸，正文圆角及页面边距露出时仍保持紫色。 -->
  <div
    aria-hidden="true"
    class="resume-page-pattern pointer-events-none absolute inset-0 -z-10"
    :style="{ background: `linear-gradient(90deg, ${themeColor}, #9753e9)` }"
  />
</template>
