<script setup>
import { inject } from "vue";
import UserHeading from "../components/userHeading.vue";

const themeColor = inject("themeColor");
</script>

<template>
  <!-- 学术风格：内容居中，底部双细线，呈现论文题名页版式 -->
  <div class="flex justify-center pb-3">
    <div class="w-fit max-w-full min-w-0">
      <UserHeading />
      <div class="mt-3 h-px w-full" :style="{ background: themeColor + '66' }"></div>
      <div class="mt-1 h-px w-full" :style="{ background: themeColor }"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
