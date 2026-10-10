<script setup>
// 白色底板正文外观（红框主题）：白色底 + 圆角 + 深色文字。
const containerStyle = {
  backgroundColor: "#ffffff", // 白色底板
  borderRadius: "18px", // 底板圆角
  color: "#222222", // 底板上的文字颜色
};
</script>

<template>
  <div class="resume-view-container relative box-border flex min-w-0" :style="containerStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
