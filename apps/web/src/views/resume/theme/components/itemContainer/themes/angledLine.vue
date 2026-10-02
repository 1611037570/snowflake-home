<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 斜角竖线条目外观：竖线在正文栏贯穿到底，条目内容按同一留白与竖线对齐。
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
  // 时间轴条目预留固定日期栏，本主题不使用日期栏
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目圆角：由外观自己声明，分片内外侧由共享规则裁剪 */
const ITEM_RADIUS = "0";
/** 条目上下与右侧留白：让条目留出呼吸间距 */
const ITEM_PADDING = "12px";
/** 条目左侧留白：竖线距正文栏左边缘的距离，正文因此与竖线对齐 */
const ITEM_PADDING_LEFT = "24px";

const {
  theme: { themeColorLine, fontValue, lineHeightValue },
} = useResumePreviewContext();

// 盒模型、分片收边与日期栏统一由共享钩子计算，渲染与测量结果一致。
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: ITEM_PADDING,
  paddingLeft: ITEM_PADDING_LEFT,
  backgroundColor: "transparent",
  borderColor: "transparent",
});

const itemStyle = computed(() => ({
  "--angled-item-line": themeColorLine.value, // 与正文竖线衔接的短横线颜色
  "--angled-item-notch": ITEM_PADDING_LEFT, // 短横线长度与条目左留白共用同一个值
  "--angled-item-offset": ITEM_PADDING, // 短横线的起始位置与条目上留白共用同一个值
  ...fontValue.value(),
  ...lineHeightValue.value(),
}));
</script>

<template>
  <div
    class="resume-item angled-line-item box-border relative"
    :class="{ 'resume-item--timeline': timeline }"
    :style="[boxStyle, fragmentStyle, itemStyle]"
  >
    <slot />
    <!-- 分片边框沿用共享收边规则，不额外绘制底色。 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
  </div>
</template>

<style scoped>
/* 条目左端短横线：从正文竖线延伸进来，与标题竖线语言衔接，不参与测量。 */
.angled-line-item::before {
  content: "";
  position: absolute;
  top: calc(var(--angled-item-offset) + 0.5lh);
  left: 0;
  width: var(--angled-item-notch);
  height: 1.5px;
  background-color: var(--angled-item-line);
  pointer-events: none;
}
</style>
