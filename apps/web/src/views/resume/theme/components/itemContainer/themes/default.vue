<script setup>
import { computed } from "vue";
import { getItemFragmentStyle } from "@/views/resume/editor/preview/resumePages/render/itemStyle";

// 默认条目外观：不绘制底色与边框，也不占内边距。
// 分片圆角与续段留白由共享分片规则计算，圆角值由外观自己声明。
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
/** 非时间轴时的左内边距 */
const PADDING_LEFT = "0px";

const fragmentStyle = computed(() =>
  getItemFragmentStyle(props.blockRange, props.contentRange, props.decoration, ITEM_RADIUS),
);
const boxStyle = computed(() => ({
  paddingTop: "0px",
  paddingRight: "0px",
  paddingBottom: "0px",
  paddingLeft: props.timeline ? "var(--timeline-rail-width)" : PADDING_LEFT,
  backgroundColor: "transparent",
}));
// 分片片段的边框边缘跟随外壳分片规则收起
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
