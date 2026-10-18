<script setup>
// 工具栏「一页纸」：发送事件，智能一页的计算与参数应用由预览层实例内部完成
import eventBus from "@/utils/modules/eventBus";

// 点击执行：通知编辑器预览实例执行智能一页
const onFitOnePage = () => {
  eventBus.emit("resume-smart-one-page");
};
</script>

<template>
  <!-- 智能一页名称常驻显示，避免依赖悬停提示才能识别功能。 -->
  <button
    type="button"
    class="flex h-12 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl px-2 text-sf-text-2 transition-colors hover:bg-sf-bg"
    @click="onFitOnePage"
  >
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 shrink-0"
    >
      <ellipse cx="14" cy="14" rx="3.1" ry="9.2" stroke="currentColor" stroke-width="1.5" />
      <ellipse cx="14" cy="14" rx="3.1" ry="9.2" transform="rotate(60 14 14)" stroke="currentColor" stroke-width="1.5" />
      <ellipse cx="14" cy="14" rx="3.1" ry="9.2" transform="rotate(120 14 14)" stroke="currentColor" stroke-width="1.5" />
    </svg>
    <span class="text-[11px] leading-none whitespace-nowrap">{{ $t("smartOnePage") }}</span>
  </button>
</template>
