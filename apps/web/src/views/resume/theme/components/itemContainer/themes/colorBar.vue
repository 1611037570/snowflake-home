<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 色条条目外观：浅色底托与左端主题色短条，延续页眉色块与标题色条的语言。
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
  // 时间轴条目预留固定日期栏，本主题不使用日期栏
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目圆角：由外观自己声明，分片内外侧由共享规则裁剪 */
const ITEM_RADIUS = "6px";
/** 条目上下与右侧留白：与模块间距共同形成呼吸空间 */
const ITEM_PADDING = "12px";
/** 条目左内边距：与标题色条右侧的文字起始位置对齐 */
const ITEM_PADDING_LEFT = "16px";

const {
  theme: { themeColor, themeColorSoft, themeColorLine, fontValue, lineHeightValue },
} = useResumePreviewContext();

// 盒模型、分片收边与日期栏统一由共享钩子计算。
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: ITEM_PADDING,
  paddingLeft: ITEM_PADDING_LEFT,
  backgroundColor: themeColorSoft.value,
  borderColor: themeColorLine.value,
});

const itemStyle = computed(() => ({
  "--color-bar-item-accent": themeColor.value, // 条目左端短条的主题色
  ...fontValue.value(),
  ...lineHeightValue.value(),
}));
</script>

<template>
  <div
    class="resume-item color-bar-item relative box-border"
    :style="[boxStyle, fragmentStyle, itemStyle]"
  >
    <slot />
    <!-- 分片边框沿用共享收边规则，颜色只取主题色派生值。 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
  </div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";

/* 左端短条与贯穿色条同色，随分片圆角收边，不参与测量。 */
.color-bar-item::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  border-radius: inherit;
  background-color: var(--color-bar-item-accent);
  pointer-events: none;
}
</style>
