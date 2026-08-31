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
  <!-- 默认风格：左侧主题色圆条 + 下细线 -->
  <div v-if="title" class="flex flex-wrap items-center border-b border-sf-b pb-2">
    <div class="mr-3 h-4 w-1 rounded-full bg-sf-theme" :style="{ background: themeColor }"></div>
    <h2 class="min-w-0 max-w-full break-words font-bold tracking-wide" :style="[fontValue(5)]">
      {{ title }}
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
