<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 荧光网格条目外观：内容底纹平铺点阵，与页面虚线网格呼应。
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
  // 时间轴条目预留固定日期栏，本主题不使用日期栏
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目圆角：由外观自己声明，分片内外侧由共享规则裁剪 */
const ITEM_RADIUS = "0";
/** 条目四周留白：让点阵底纹在文字外圈保留一圈完整单元格 */
const ITEM_PADDING = "12px";
/** 点阵单元格边长：与页面网格同源，取 12px 保证单元格完整 */
const GRID_CELL = 12;
/** 点阵圆点直径：1px 的小点只做纹理提示，不干扰正文阅读 */
const GRID_DOT = 1;

const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();

// 盒模型、分片收边与日期栏统一由共享钩子计算，渲染与测量结果一致。
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: ITEM_PADDING,
  paddingLeft: ITEM_PADDING,
  backgroundColor: "transparent",
  borderColor: "transparent",
});

// 续段不重复铺点阵：跨页后的半截条目只保留文字与首段刻度线。
const isItemStart = computed(
  () => !(props.blockRange.start > 0 || (props.contentRange?.start ?? 0) > 0),
);
// 点阵与刻度线的颜色全部由主题色推导，避免硬编码色值。
const itemStyle = computed(() => ({
  "--marker-grid-dot": `color-mix(in srgb, ${themeColor.value} 30%, transparent)`, // 点阵圆点颜色
  "--marker-grid-tick": themeColorLine.value, // 首段刻度线颜色取自主题色 40% 的线条色
  "--marker-grid-cell": `${GRID_CELL}px`, // 点阵单元格边长
  "--marker-grid-offset": `${GRID_CELL / 2}px`, // 圆点在单元格内的居中偏移
  "--marker-grid-dot-size": `${GRID_DOT}px`, // 单个圆点的直径
}));
</script>

<template>
  <div
    class="resume-item marker-grid-item box-border"
    :class="{ 'marker-grid-item--start': isItemStart }"
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
/* 条目根元素作为点阵与刻度线的定位基准，不改变自身尺寸。 */
.marker-grid-item {
  position: relative;
}

/* 首段刻度线：只在条目起点画一小段，替代整条边框分隔相邻条目。 */
.marker-grid-item--start::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 36px;
  height: 2px;
  background-color: var(--marker-grid-tick);
  pointer-events: none;
}

/* 点阵底纹按单元格平铺：径向渐变绘制圆点，不参与分页测量。 */
.marker-grid-item--start {
  background-image: radial-gradient(
    circle at var(--marker-grid-offset) var(--marker-grid-offset),
    var(--marker-grid-dot) 0 var(--marker-grid-dot-size),
    transparent var(--marker-grid-dot-size)
  );
  background-position: 0 0;
  background-size: var(--marker-grid-cell) var(--marker-grid-cell);
}
</style>
