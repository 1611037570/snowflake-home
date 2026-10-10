<script setup lang="ts">
import { useResumePreviewContext } from "../shared/previewContext";

defineProps<{
  value: string; // 业务模块格式化后的日期文案
  dateRail?: boolean; // 是否使用公共条目预留的固定日期栏
}>();
const { theme: { datePosition, fontValue } } = useResumePreviewContext();
</script>

<template>
  <!-- 日期布局统一消费公共日期栏能力，业务组件仅提供文案。 -->
  <div
    class="flex max-w-full min-w-0 flex-wrap items-center"
    :class="dateRail ? 'resume-timeline-date' : datePosition === 'left' ? 'order-first' : ''"
  >
    <span
      :class="{ 'font-bold': datePosition === 'left' && !dateRail }"
      :style="datePosition === 'left' && !dateRail ? fontValue(1) : undefined"
    >{{ value }}</span>
  </div>
</template>

<style scoped>
/* 日期绘制在条目预留栏内，不改变正文宽度预算。 */
.resume-timeline-date {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(var(--timeline-rail-width) - 24px);
  opacity: 0.7;
}
</style>
