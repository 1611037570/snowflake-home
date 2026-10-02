<script setup>
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 红框主题条目外观：白底正文内的条目靠细分隔线分区，上下内边距保持紧凑。
// 留白、圆角与分片收边统一由 useItemBox 给出，渲染与测量因此共用同一份尺寸。
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
  // 是否预留左侧时间轴日期栏：本主题不使用日期栏
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目圆角：正文只有细分隔线，转角保持直角 */
const ITEM_RADIUS = "0";
/** 条目左右内边距：同时作为细分隔线两侧的缩进，与正文起始线对齐 */
const PADDING_X = "12px";
/** 条目纵向内边距：与模块段落间距共同留出条目之间的呼吸空间 */
const PADDING_Y = "3px";

const {
  theme: { themeColorSoft, themeColorLine, fontValue, lineHeightValue },
} = useResumePreviewContext();

const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: PADDING_Y,
  paddingLeft: PADDING_X,
  backgroundColor: themeColorSoft.value,
  borderColor: themeColorLine.value,
});

// 底色与分隔线的颜色只从预览上下文取主题色派生值，不写死色值
const frameStyle = {
  "--frame-item-bg": themeColorSoft.value, // 条目浅色底托
  "--frame-item-line": themeColorLine.value, // 条目细分隔线
  "--frame-item-inset": PADDING_X, // 细分隔线两侧缩进，与内边距一致
};
</script>

<template>
  <div
    class="resume-item frame-item box-border"
    :class="{ 'resume-item--timeline': timeline }"
    :style="[boxStyle, fragmentStyle, frameStyle, fontValue(), lineHeightValue()]"
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

/* 细分隔线画在条目底边：跨页首段不画线，避免分片开头多出一条收口线 */
.frame-item::after {
  content: "";
  position: absolute;
  right: var(--frame-item-inset);
  bottom: 0;
  left: var(--frame-item-inset);
  height: 1px;
  background-color: var(--frame-item-line);
  pointer-events: none;
}
</style>
