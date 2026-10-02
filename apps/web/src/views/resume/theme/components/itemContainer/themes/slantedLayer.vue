<script>
// 斜切叠片条目不使用左侧日期栏，日期仍跟随正文头部的日期位置设置。
const usesDateRail = false;
export default { usesDateRail };
</script>

<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 斜切叠片条目外观：底片向右上错位铺满条目，底边切出斜角，斜边上压一条主题色细线。
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

/** 条目圆角：底片走斜角，矩形本身不切圆角 */
const ITEM_RADIUS = "0";
/** 条目四周留白：底片与斜切线都画在这段留白之外，不额外占高 */
const ITEM_PADDING = "12px";
/** 条目左侧留白：恒定与四周留白同值，底片因此左右都压在留白上 */
const ITEM_PADDING_LEFT = "12px";

const {
  theme: { themeColor, themeColorSoft, themeColorLine, fontValue, lineHeightValue },
} = useResumePreviewContext();

// 盒模型、分片收边与日期栏统一由共享钩子计算，渲染与测量得到同一份尺寸。
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: ITEM_PADDING,
  paddingLeft: ITEM_PADDING_LEFT,
  backgroundColor: "transparent",
  borderColor: "transparent",
});

const itemStyle = computed(() => ({
  "--slanted-item-plate": themeColorSoft.value, // 底片底色：主题色 10%
  "--slanted-item-edge": themeColorLine.value, // 斜边上的细线：主题色 40%
  "--slanted-item-name": themeColor.value, // 经历名称使用的主题色
  "--slanted-item-inset-y": `-${ITEM_PADDING}`, // 底片上下各外扩一份留白，铺满整条条目
  "--slanted-item-inset-left": `-${ITEM_PADDING_LEFT}`, // 底片左侧外扩一份留白，压住条目左缘
  "--slanted-item-inset-right": "-8px", // 底片右侧外扩，向右错位形成叠片层次
  "--slanted-item-cut": "8px", // 底边斜切高度，与右侧错位取同一数值保持斜角一致
  "--slanted-item-line": "1px", // 斜边细线的竖直厚度，两条斜边因此保持平行
  ...fontValue.value(),
  ...lineHeightValue.value(),
}));

// 底片与细线共用同一段内缩范围，斜边才会落在同一条斜线上。
const slantedInsetStyle = computed(() => ({
  top: "var(--slanted-item-inset-y)", // 底片上沿外扩
  right: "var(--slanted-item-inset-right)", // 底片右沿外扩
  bottom: "var(--slanted-item-inset-y)", // 底片下沿外扩
  left: "var(--slanted-item-inset-left)", // 底片左沿外扩
}));

// 斜边细线只比底片下沿抬高一个线宽，两条斜边平行、间距恒定。
const edgeInsetStyle = computed(() => ({
  top: "var(--slanted-item-inset-y)", // 与底片上沿对齐
  right: "var(--slanted-item-inset-right)", // 与底片右沿对齐
  bottom: `calc(var(--slanted-item-inset-y) + var(--slanted-item-line))`, // 抬高一个线宽贴住斜边
  left: "var(--slanted-item-inset-left)", // 与底片左沿对齐
}));
</script>

<template>
  <!-- 外壳只保留条目留白与分片收边，底片、斜边与分片描边由绝对定位图层绘制。 -->
  <!-- isolate 让负层级只落在条目内部：底片压在条目文字之下，又不会被纸张底色盖住。 -->
  <div class="slanted-layer-item relative isolate box-border" :style="[itemStyle, boxStyle, fragmentStyle]">
    <!-- 底片：左右都压在条目留白上，底边从左下抬到右下，与标题背片共用同一种斜角。 -->
    <span
      aria-hidden="true"
      class="slanted-layer-item__plate pointer-events-none absolute -z-10"
      :style="slantedInsetStyle"
    />
    <!-- 斜边细线：与底片斜边平行并抬高一个线宽，收住叠片的斜切走向。 -->
    <span
      aria-hidden="true"
      class="slanted-layer-item__edge pointer-events-none absolute -z-10"
      :style="edgeInsetStyle"
    />
    <slot />
    <!-- 分片边框沿用共享收边规则，随分片起止收起对应边的描边。 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
  </div>
</template>

<style scoped>
/* 底片沿底边斜切：左下抬高、右下贴齐，切角高度与右侧错位等值。 */
.slanted-layer-item__plate {
  background-color: var(--slanted-item-plate);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - var(--slanted-item-cut)));
}

/* 斜边细线：把抬高一个线宽的底片裁成斜边上方的一层主题色。 */
.slanted-layer-item__edge {
  background-color: var(--slanted-item-edge);
  clip-path: polygon(
    0 var(--slanted-item-cut),
    100% 0,
    100% calc(100% - var(--slanted-item-cut) + var(--slanted-item-line) * 1.414),
    0 calc(100% + var(--slanted-item-line) * 1.414)
  );
}

/* 经历名称沿用标题的斜切语言，用主题色与中等字重区分。 */
.slanted-layer-item :deep(> .flex:first-child > .min-w-0:first-child > .font-bold) {
  color: var(--slanted-item-name);
  font-weight: 500;
}
</style>
