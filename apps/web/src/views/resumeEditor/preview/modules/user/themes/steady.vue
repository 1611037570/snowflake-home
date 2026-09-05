<script setup>
import { inject } from "vue";
import UserHeading from "../components/userHeading.vue";

const themeColor = inject("themeColor");
</script>

<template>
  <!-- 稳重风格：整块左侧贯穿主题色竖线，不加背景修饰 -->
  <div class="border-l pl-3" :style="{ borderLeftWidth: '3px', borderColor: themeColor }">
    <UserHeading />
  </div>
</template>

<style lang="scss" scoped></style>
