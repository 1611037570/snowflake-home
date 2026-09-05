<script setup>
import { inject } from "vue";
import UserHeading from "../components/userHeading.vue";

const themeColor = inject("themeColor");
</script>

<template>
  <!-- 清新风格：浅色大圆角卡片承载信息并整体居中，柔和清爽 -->
  <div class="rounded-2xl px-3 py-3" :style="{ background: themeColor + '14' }">
    <div class="flex justify-center">
      <div class="w-fit max-w-full min-w-0">
        <UserHeading />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
