<script setup>
import { inject } from "vue";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const fontValue = inject("fontValue");
</script>

<template>
  <!-- 简约风格：纯标题文字，无装饰 -->
  <h2 v-if="title" class="max-w-full min-w-0 font-bold tracking-wide break-words">
    {{ title }}
  </h2>
</template>

<style lang="scss" scoped></style>
