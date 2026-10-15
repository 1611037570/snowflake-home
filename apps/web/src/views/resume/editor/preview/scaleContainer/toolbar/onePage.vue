<script setup>
// 工具栏「一页纸」：发送事件，智能一页的计算与参数应用由预览层实例内部完成
import eventBus from "@/utils/modules/eventBus";

// 点击执行：通知编辑器预览实例执行智能一页
const onFitOnePage = () => {
  eventBus.emit("resume-smart-one-page");
};
</script>

<template>
  <SfTooltip :content="$t('smartOnePage')">
    <!-- 轨道缩至与工具栏其他图标接近的尺寸，保持原按钮占位。 -->
    <svg
      @click="onFitOnePage"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="cursor-pointer rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
    >
      <ellipse cx="14" cy="14" rx="3.1" ry="9.2" stroke="currentColor" stroke-width="1.5" />
      <ellipse cx="14" cy="14" rx="3.1" ry="9.2" transform="rotate(60 14 14)" stroke="currentColor" stroke-width="1.5" />
      <ellipse cx="14" cy="14" rx="3.1" ry="9.2" transform="rotate(120 14 14)" stroke="currentColor" stroke-width="1.5" />
    </svg>
  </SfTooltip>
</template>
