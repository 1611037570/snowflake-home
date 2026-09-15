<script setup>
// 点击入口在新窗口打开 GitHub Issues
const goToIssues = () => {
  window.open("https://github.com/1611037570/snowflake-home/issues", "_blank", "noopener,noreferrer");
};
</script>

<template>
  <!-- 文案较短，按实际宽度调整入口的收起与展开位置 -->
  <div
    class="flex-c fixed -right-23 bottom-6 z-50 cursor-pointer rounded-l-3xl bg-sf-theme p-3 text-sf-theme-text transition-all duration-300 hover:-translate-x-21"
    @click="goToIssues"
  >
    <SfIcon icon="ph:chat-teardrop-dots-fill" size="5" />
    <span class="pr-6 pl-3 text-sm whitespace-nowrap">问题反馈</span>
  </div>
</template>
