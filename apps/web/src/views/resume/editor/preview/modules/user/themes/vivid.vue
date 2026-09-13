<script setup>
import { inject } from "vue";
import UserHeading from "../components/userHeading.vue";

const themeColor = inject("themeColor");
</script>

<template>
  <!-- 活力风格：主题色描边圆角卡片，边缘清晰利落 -->
  <div
    class="rounded-xl border px-3 py-3"
    :style="{ borderColor: themeColor + '80', background: themeColor + '0d' }"
  >
    <UserHeading />
  </div>
</template>

<style lang="scss" scoped></style>
