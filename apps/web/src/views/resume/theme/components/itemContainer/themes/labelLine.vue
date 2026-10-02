<script>
// 色块横线条目外观具备日期栏能力：分组条目把日期移入左侧固定栏与标题对齐。
const usesDateRail = true;
export default { usesDateRail };
</script>

<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 色块横线条目外观：左端竖色块接短横线，正文起始线与标题色块同一套设计语言。
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

/** 条目圆角：色块线条为直角，与标题色块保持一致 */
const ITEM_RADIUS = "0";
/** 条目四周留白：同一数值参与竖色块与短横线的纵向定位 */
const ITEM_PADDING = "12px";
/** 条目左侧留白：为竖色块与短横线让出的空间 */
const ITEM_PADDING_LEFT = "14px";
/** 竖色块宽度：与标题色块左缘呼应的粗细 */
const ITEM_LABEL_WIDTH = "6px";
/** 短横线高度：与竖色块同一厚度，形成横线标签的收笔 */
const ITEM_LABEL_LINE_HEIGHT = "2px";

const {
  ui,
  theme: { themeColor, themeColorSoft, themeColorLine, fontValue, lineHeightValue },
} = useResumePreviewContext();

// 双栏版式的栏内内容紧贴栏边：单栏以外的版式不绘制左端色块，避免越过分栏线。
const isTwoColumn = computed(
  () => ui.value?.layout?.type === "twoColumn" || ui.value?.layout?.type === "topUserTwoColumn",
);

// 盒模型、分片收边与日期栏统一由共享钩子计算，渲染与测量结果一致。
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: ITEM_PADDING,
  paddingLeft: ITEM_PADDING_LEFT,
  backgroundColor: "transparent",
  borderColor: "transparent",
});

const itemStyle = computed(() => ({
  // 仅单栏绘制左端色块：双栏下取透明，竖块与横线一并不显示
  "--label-line-accent": isTwoColumn.value ? "transparent" : themeColor.value, // 竖色块底色
  "--label-line-soft": themeColorSoft.value, // 竖色块下段的淡色收尾
  "--label-line-line": themeColorLine.value, // 短横线颜色
  "--label-line-padding": ITEM_PADDING, // 竖色块与短横线的纵向基准
  "--label-line-notch": ITEM_PADDING_LEFT, // 短横线长度与条目左留白共用同一个值
  "--label-line-width": ITEM_LABEL_WIDTH, // 竖色块宽度
  "--label-line-thickness": ITEM_LABEL_LINE_HEIGHT, // 短横线高度
  ...fontValue.value(),
  ...lineHeightValue.value(),
}));
</script>

<template>
  <div
    class="resume-item label-line-item box-border relative"
    :class="{ 'resume-item--timeline': timeline }"
    :style="[boxStyle, fragmentStyle, itemStyle]"
  >
    <slot />
    <!-- 分片边框沿用共享收边规则，条目自身不映射底色。 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
  </div>
</template>

<style scoped>
/* 竖色块：从条目上留白起画，下端以淡色收尾，呼应标题色块 */
.label-line-item::before {
  content: "";
  position: absolute;
  top: var(--label-line-padding);
  left: 0;
  width: var(--label-line-width);
  height: calc(0.5lh + var(--label-line-padding));
  background-image: linear-gradient(
    to bottom,
    var(--label-line-accent),
    var(--label-line-soft)
  );
  pointer-events: none;
}

/* 短横线：与竖色块同厚，从竖块向右延伸出标签的横线部分 */
.label-line-item::after {
  content: "";
  position: absolute;
  top: calc(var(--label-line-padding) + 0.5lh);
  left: 0;
  width: var(--label-line-notch);
  height: var(--label-line-thickness);
  background-color: var(--label-line-line);
  pointer-events: none;
}
</style>
