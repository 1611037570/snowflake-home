<script setup>
import { computed } from "vue";
import { getItemFragmentStyle } from "@/views/resume/editor/preview/resumePages/render/itemStyle";

// 斜角竖线条目外观：条目向模块竖线内侧留白，左侧留白独立指定。
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

/** 条目圆角：由外观自己声明，分片内外侧由共享规则裁剪 */
const ITEM_RADIUS = "0";
/** 斜角竖线主题的条目左侧留白，与模块竖线保持距离 */
const PADDING_LEFT = "12px";

const fragmentStyle = computed(() =>
  getItemFragmentStyle(props.blockRange, props.contentRange, props.decoration, ITEM_RADIUS),
);
const boxStyle = computed(() => ({
  paddingTop: "12px",
  paddingRight: "12px",
  paddingBottom: "12px",
  paddingLeft: props.timeline ? "var(--timeline-rail-width)" : PADDING_LEFT,
  backgroundColor: "transparent",
}));
const borderStyle = computed(() => ({
  borderColor: "transparent",
  borderRadius: "inherit",
  borderTopWidth: fragmentStyle.value.borderTopWidth,
  borderBottomWidth: fragmentStyle.value.borderBottomWidth,
}));
</script>

<template>
  <div
    class="resume-item box-border"
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
</style>
