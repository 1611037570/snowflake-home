<script setup>
import UserHeading from "../components/userHeading.vue";
import { useResumePreviewContext } from "../../../previewContext";

// 浅底色：统一由主题色推导
const {
  theme: { themeColorSoft },
} = useResumePreviewContext();
</script>

<template>
  <!-- 清新风格：浅色大圆角卡片承载信息并整体居中，柔和清爽 -->
  <div class="rounded-2xl px-3 py-3" :style="{ background: themeColorSoft }">
    <div class="flex justify-center">
      <div class="w-full max-w-full min-w-0">
        <UserHeading />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
