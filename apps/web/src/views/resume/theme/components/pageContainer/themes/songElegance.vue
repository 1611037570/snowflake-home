<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();

// 横格步长取 3 的倍数并与正文行高节奏接近，避免纹理与文字相互干扰
const RULE_STEP = 30;

// 只画横向细线：颜色取主题色的一成透明度，作为纸张纹理，不参与排版
const ruleImage = computed(
  () =>
    `repeating-linear-gradient(to bottom, ${themeColor.value}0d 0 1px, transparent 1px ${RULE_STEP}px)`,
);
</script>

<template>
  <!-- 横格纹理铺满整张纸，负层级压在纸张底色之上、正文之下 -->
  <div
    aria-hidden="true"
    class="resume-page-pattern pointer-events-none absolute inset-0 -z-10"
    :style="{ backgroundImage: ruleImage }"
  />
</template>

<style lang="scss" scoped></style>
