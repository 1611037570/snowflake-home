<script setup>
// 点击入口跳转至 GitHub Issues
const goToIssues = () => {
  window.location.href = "https://github.com/1611037570/snowflake-home/issues";
};
</script>

<template>
  <!-- 默认露出图标，悬停时整体滑出反馈文案 -->
  <div
    class="flex-c fixed -right-30 bottom-6 z-50 cursor-pointer rounded-l-3xl bg-sf-theme p-3 text-sf-theme-text transition-all duration-300 hover:-translate-x-28"
    @click="goToIssues"
  >
    <SfIcon icon="ph:chat-teardrop-dots-fill" size="5" />
    <span class="pr-6 pl-3 text-sm whitespace-nowrap">问题反馈</span>
  </div>
</template>
