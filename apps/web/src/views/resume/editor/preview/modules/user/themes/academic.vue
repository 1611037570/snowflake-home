<script setup>
import UserHeading from "../components/userHeading.vue";
import { useResumePreviewContext } from "../../../previewContext";

// 线条色：统一由主题色推导
const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 学术风格：内容居中，底部双细线，呈现论文题名页版式 -->
  <div class="flex justify-center pb-3">
    <div class="w-full max-w-full min-w-0">
      <UserHeading />
      <div class="mt-3 h-px w-full" :style="{ background: themeColorLine }"></div>
      <div class="mt-1 h-px w-full" :style="{ background: themeColor }"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
