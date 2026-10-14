<script setup>
import HairlineRail from "./hairlineRail.vue";

// 复用现有时间轴条目盒模型，日期栏与无日期正文保持同一缩进。
defineOptions({ inheritAttrs: false });
</script>

<template>
  <HairlineRail class="compact-timeline-item" v-bind="$attrs">
    <slot />
  </HairlineRail>
</template>

<style scoped>
/* 日期在固定栏内完整单行呈现，极长日期则收起以免压到轴线。 */
.compact-timeline-item :deep(.resume-timeline-date) {
  width: calc(var(--timeline-rail-width) - 24px);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.compact-timeline-item :deep(.resume-timeline-date > span) {
  box-sizing: border-box;
  width: calc(100% - 12px);
  overflow: hidden;
  margin: 0 6px;
  padding: 3px 6px;
  border-radius: 3px;
  background: #596a55;
  color: #fff;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
