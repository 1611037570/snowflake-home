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
  <h2
    v-if="title"
    class="min-w-0 max-w-full break-words pb-2 font-bold tracking-wide"
    :style="[fontValue(5)]"
  >
    {{ title }}
  </h2>
</template>

<style lang="scss" scoped></style>
