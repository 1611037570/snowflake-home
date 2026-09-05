<script setup>
import { inject } from "vue";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const fontValue = inject("fontValue");
const themeColor = inject("themeColor");
</script>

<template>
  <!-- 清新风格：浅色圆角胶囊底托起标题文字，圆润轻盈 -->
  <div v-if="title" class="pb-3">
    <h2
      class="inline-block max-w-full min-w-0 rounded-full px-4 py-1 font-bold tracking-wide break-words"
      :style="[{ background: themeColor + '1a' }, fontValue(5)]"
    >
      {{ title }}
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
