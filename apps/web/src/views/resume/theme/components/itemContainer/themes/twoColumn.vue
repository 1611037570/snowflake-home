<script setup>
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 双栏条目外观：紧凑留白 + 浅底圆角卡片，与左栏浅底形成两层递进的白。
// 分片圆角与续段收边由共享盒模型计算，本组件只声明圆角、留白与配色。
const props = defineProps({
  // 分片覆盖的块区间：续段不画上圆角、不补上内边距
  blockRange: {
    type: Object,
    default: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }),
  },
  // 分片覆盖的正文区间
  contentRange: { type: Object, default: undefined },
  // 分片装饰类型
  decoration: { type: String, default: "full" },
  // 时间轴条目预留固定日期栏，本主题不使用日期栏
  timeline: { type: Boolean, default: false },
});

/** 条目圆角：圆角卡片与模块标题的圆头竖条使用同一套圆润语言 */
const ITEM_RADIUS = "6px";
/** 条目四周紧凑留白：栏宽较窄，条目之间靠内边距留白而不是外边距 */
const ITEM_PADDING = "12px";
/** 非时间轴时的左内边距：与其余三边同值，左右栏文字起始线因此一致 */
const ITEM_PADDING_LEFT = "12px";

const {
  theme: { themeColorSoft, themeColorLine },
} = useResumePreviewContext();

// 盒模型、分片收边与日期栏统一由共享钩子计算，渲染与测量结果一致。
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: ITEM_PADDING,
  paddingLeft: ITEM_PADDING_LEFT,
  backgroundColor: themeColorSoft.value,
  borderColor: themeColorLine.value,
});
</script>

<template>
  <div class="resume-item two-column-item box-border" :style="[boxStyle, fragmentStyle]">
    <slot />
    <!-- 描边独立成层：分片上下边缘与圆角跟随共享盒模型收起，不影响条目测量高度 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
  </div>
</template>

<style scoped>
/* 描边层以条目自身为定位基准，条目在栏内保持圆角卡片 */
.two-column-item {
  position: relative;
}
</style>
