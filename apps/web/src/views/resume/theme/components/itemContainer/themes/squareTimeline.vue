<script>
// 日期栏能力随条目外观声明，测量、预览和设置限制使用同一口径。
export default { usesDateRail: true }; // 是否使用左侧日期栏
</script>

<script setup>
import { useItemBox } from "../useItemBox";

// 方节点时间轴条目自行管理日期栏、正文缩进和日期排列。
// 分片圆角与续段留白由共享盒模型计算，圆角值由外观自己声明。
const props = defineProps({
  // 分片覆盖的块区间：续段不画上圆角、不补上内边距
  blockRange: {
    type: Object,
    default: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }),
  },
  // 分片覆盖的正文区间
  contentRange: {
    type: Object,
    default: undefined,
  },
  // 分片装饰类型
  decoration: {
    type: String,
    default: "full",
  },
  // 时间轴条目预留固定日期栏
  timeline: {
    type: Boolean,
    default: false,
  },
});

const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: "0", // 条目不绘制圆角
  paddingLeft: "var(--square-timeline-rail-width)", // 无日期正文仍与日期栏右侧对齐
});
</script>

<template>
  <div
    class="resume-item square-timeline-item box-border"
    :class="{ 'resume-item--timeline': timeline }"
    :style="[boxStyle, fragmentStyle]"
  >
    <slot />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
  </div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";

/* 日期栏宽度与区域贯穿线共用变量，条目自身不重复画线。 */
.square-timeline-item.resume-item--timeline {
  --timeline-rail-width: var(--square-timeline-rail-width);
}

.square-timeline-item.resume-item--timeline::before {
  display: none;
}

/* 只有日期头部的首段需要保留三行高度，续段沿用正文高度。 */
.square-timeline-item:has(.resume-timeline-date) {
  min-height: 3lh;
}

.square-timeline-item :deep(.resume-timeline-date) {
  justify-content: center;
  opacity: 1;
}

.square-timeline-item :deep(.resume-timeline-date > span) {
  width: min-content;
  text-align: center;
}
</style>
