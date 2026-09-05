<script setup>
import { inject } from "vue";
import UserHeading from "../components/userHeading.vue";

const themeColor = inject("themeColor");
</script>

<template>
  <!-- 创意风格：浅色圆角卡片配右侧主题色竖条，与标题右置形成呼应 -->
  <div
    class="relative overflow-hidden rounded-xl py-3 pr-4 pl-3"
    :style="{ background: themeColor + '1a' }"
  >
    <div class="absolute inset-y-0 right-0 w-1.5" :style="{ background: themeColor }"></div>
    <UserHeading />
  </div>
</template>

<style lang="scss" scoped></style>
