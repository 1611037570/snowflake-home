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
  <!-- 学术风格：标题居中，两侧延伸细线，形似论文章节标题 -->
  <div v-if="title" class="flex items-center gap-3 pb-3">
    <div class="h-px min-w-0 flex-1" :style="{ background: themeColor + '66' }"></div>
    <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words" :style="[fontValue(5)]">
      {{ title }}
    </h2>
    <div class="h-px min-w-0 flex-1" :style="{ background: themeColor + '66' }"></div>
  </div>
</template>

<style lang="scss" scoped></style>
