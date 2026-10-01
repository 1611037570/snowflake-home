<script setup>
import { computed } from "vue";
import { getItemFragmentStyle } from "@/views/resume/editor/preview/resumePages/render/itemStyle";

// 线框条目外观：外框由模块外壳绘制，条目只保留内边距。
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

const fragmentStyle = computed(() =>
  getItemFragmentStyle(props.blockRange, props.contentRange, props.decoration, ITEM_RADIUS),
);
const boxStyle = computed(() => ({
  paddingTop: "12px",
  paddingRight: "12px",
  paddingBottom: "12px",
  // 左侧内边距沿用既有渲染值：非时间轴时为 0，时间轴让位给日期栏
  paddingLeft: props.timeline ? "var(--timeline-rail-width)" : "0px",
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
