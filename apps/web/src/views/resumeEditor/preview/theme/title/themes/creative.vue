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
  <!-- 创意风格：标题靠右，左侧延伸主题色细线形成不对称节奏 -->
  <div v-if="title" class="flex items-center pb-3">
    <div class="mr-3 h-px min-w-0 flex-1" :style="{ background: themeColor + '66' }"></div>
    <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words" :style="[fontValue(5)]">
      {{ title }}
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
