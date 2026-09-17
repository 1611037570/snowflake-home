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
  <!-- 现代风格：标题居中 + 主题色短横线 -->
  <div v-if="title" class="flex flex-col items-center">
    <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words">
      {{ title }}
    </h2>
    <div class="mt-1 h-1 w-8 rounded-full" :style="{ background: themeColor }"></div>
  </div>
</template>

<style lang="scss" scoped></style>
