<script setup>
import { inject } from "vue";
import TitleText from "../titleText.vue";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
// 线条色：统一由主题色推导
const themeColorLine = inject("themeColorLine");
</script>

<template>
  <!-- 学术风格：标题居中，两侧延伸细线，形似论文章节标题 -->
  <div v-if="title" class="flex items-center gap-3">
    <div class="h-px min-w-0 flex-1" :style="{ background: themeColorLine }"></div>
    <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words">
      <TitleText :title="title" />
    </h2>
    <div class="h-px min-w-0 flex-1" :style="{ background: themeColorLine }"></div>
  </div>
</template>

<style lang="scss" scoped></style>
