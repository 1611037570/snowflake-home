<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "../../../previewContext";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 默认风格：左侧主题色圆条 + 下细线 -->
  <div v-if="title" class="flex h-auto flex-wrap items-center border-b border-sf-b">
    <div
      class="mr-3 w-1 self-stretch rounded-full bg-sf-theme"
      :style="{ background: themeColor }"
    ></div>
    <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
