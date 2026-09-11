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
  <!-- 商务风格：左侧主题色直角竖条 + 底部主题色粗线 -->
  <div v-if="title" class="border-b-2 pb-2" :style="{ borderColor: themeColor }">
    <div class="flex items-center">
      <div class="mr-3 h-4 w-1" :style="{ background: themeColor }"></div>
      <h2 class="min-w-0 max-w-full break-words font-bold tracking-wide" :style="[fontValue(5)]">
        {{ title }}
      </h2>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
