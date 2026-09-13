<script setup>
import { inject } from "vue";
import UserHeading from "../components/userHeading.vue";

const themeColor = inject("themeColor");
</script>

<template>
  <!-- 商务风格：浅色圆角卡片，左侧主题色竖条点缀 -->
  <div
    class="relative overflow-hidden rounded-xl py-2 pl-4 pr-3"
    :style="{ backgroundColor: themeColor + '1a' }"
  >
    <div class="absolute inset-y-0 left-0 w-1.5" :style="{ background: themeColor }"></div>
    <UserHeading />
  </div>
</template>

<style lang="scss" scoped></style>
