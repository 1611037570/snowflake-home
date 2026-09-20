<script setup>
import { inject } from "vue";
import UserHeading from "../components/userHeading.vue";

const themeColor = inject("themeColor");
</script>

<template>
  <!-- 经典风格：用户区以通栏主题色细线收尾，与模块标题分节线呼应 -->
  <div class="border-b pb-3" :style="{ borderBottomWidth: '1px', borderColor: themeColor }">
    <UserHeading />
  </div>
</template>

<style lang="scss" scoped></style>
