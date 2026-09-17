<script setup>
import { inject } from "vue";
import UserHeading from "../components/userHeading.vue";

// 浅底色与线条色：统一由主题色推导
const themeColorSoft = inject("themeColorSoft");
const themeColorLine = inject("themeColorLine");
</script>

<template>
  <!-- 活力风格：主题色描边圆角卡片，边缘清晰利落 -->
  <div
    class="rounded-xl border px-3 py-3"
    :style="{ borderColor: themeColorLine, background: themeColorSoft }"
  >
    <UserHeading />
  </div>
</template>

<style lang="scss" scoped></style>
