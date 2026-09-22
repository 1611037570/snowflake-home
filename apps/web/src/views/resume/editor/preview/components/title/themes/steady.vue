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
  <!-- 稳重风格：主题色实心小方块搭配标题文字，规整有力 -->
  <div v-if="title" class="flex items-center">
    <div class="mr-3 h-3 w-3 shrink-0" :style="{ background: themeColor }"></div>
    <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
