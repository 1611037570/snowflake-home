<script>
// 正文留白由外观组件维护，分页从组件导出读取同一份尺寸。
const regionPadding = {
  top: 12, // 正文距底板上沿的距离
  right: 12, // 正文距底板右沿的距离
  bottom: 12, // 正文距底板下沿的距离
  left: 12, // 正文距底板左沿的距离
};
export default {
  regionPadding, // 分页与组件共用的正文留白
};
</script>

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
