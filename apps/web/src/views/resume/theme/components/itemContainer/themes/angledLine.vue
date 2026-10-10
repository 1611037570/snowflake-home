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
  theme: { fontValue, lineHeightValue },
} = useResumePreviewContext();

// 盒模型、分片收边与日期栏统一由共享钩子计算，渲染与测量结果一致。
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: ITEM_PADDING,
  paddingLeft: ITEM_PADDING_LEFT,
  backgroundColor: "transparent",
  borderColor: "transparent",
});

// 条目仅设置文字样式，贯穿竖线由正文区域绘制。
const itemStyle = computed(() => ({
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
