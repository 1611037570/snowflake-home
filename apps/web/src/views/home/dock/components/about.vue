<template>
  <SfAbout>
    <div
      class="flex h-10 w-10 items-center justify-center rounded-lg bg-sf-primary backdrop-blur-md"
    >
      <SfLogo name="home" />
    </div>
  </SfAbout>
</template>

<script setup></script>

<style scoped>
/* 添加容器悬停效果 */
.sf-set-container {
  transition: all 0.2s ease;
}

/* 确保内容区域有良好的间距 */
.text-center {
  margin: 16px 0;
}
</style>
