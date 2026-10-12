<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const {
  theme: { themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 保留色条的浅色横向底纹，不绘制左侧竖线。 -->
  <div class="flex items-baseline" :style="{ background: themeColorLine }">
    <h2 class="max-w-full min-w-0 px-3 font-bold tracking-wide break-words">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
