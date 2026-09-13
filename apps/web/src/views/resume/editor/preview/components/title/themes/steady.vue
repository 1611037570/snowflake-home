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
  <!-- 稳重风格：主题色实心小方块搭配标题文字，规整有力 -->
  <div v-if="title" class="flex items-center pb-3">
    <div class="mr-3 h-3 w-3 shrink-0" :style="{ background: themeColor }"></div>
    <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words" :style="[fontValue(5)]">
      {{ title }}
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
