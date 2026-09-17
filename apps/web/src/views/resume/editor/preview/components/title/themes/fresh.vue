<script setup>
import { inject } from "vue";
import TitleText from "../titleText.vue";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const fontValue = inject("fontValue");
// 浅底色：统一由主题色推导
const themeColorSoft = inject("themeColorSoft");
</script>

<template>
  <!-- 清新风格：浅色圆角胶囊底托起标题文字，圆润轻盈 -->
  <div v-if="title">
    <h2
      class="inline-block max-w-full min-w-0 rounded-full px-4 py-1 font-bold tracking-wide break-words"
      :style="[{ background: themeColorSoft }]"
    >
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
