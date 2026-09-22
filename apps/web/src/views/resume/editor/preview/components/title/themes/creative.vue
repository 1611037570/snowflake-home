<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "../../../previewContext";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
// 线条色：统一由主题色推导
const {
  theme: { themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 创意风格：标题靠右，左侧延伸主题色细线形成不对称节奏 -->
  <div v-if="title" class="flex items-center">
    <div class="mr-3 h-px min-w-0 flex-1" :style="{ background: themeColorLine }"></div>
    <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
