<script>
// 折角标签条目外观沿用标题的色块语言，不使用左侧日期栏：能力由外观自己声明。
const usesDateRail = false;
export default { usesDateRail };
</script>

<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 折角标签条目外观：主体色块承接标题色块，右上角折出暗面折片与亮色的折起，形成折角标签。
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
/** 条目四周留白：折角绘制在这段留白里，不额外占高，分页尺寸不变 */
const ITEM_PADDING = "12px";
/** 折角边长：与条目留白取同一数值，折片恰好落在留白的角上 */
const FOLD_SIZE = "12px";

const {
  theme: { themeColor, themeColorContrast, fontValue, lineHeightValue },
} = useResumePreviewContext();

// 盒模型、分片收边与日期栏统一由共享钩子计算，渲染与测量得到同一份尺寸。
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: ITEM_PADDING,
  backgroundColor: themeColor.value,
  borderColor: "transparent",
});

const itemStyle = computed(() => ({
  "--folded-item-accent": themeColor.value, // 条目色块底：与标题色块同色
  "--folded-item-contrast": themeColorContrast.value, // 色块上的文字与折起亮面
  "--folded-item-fold": FOLD_SIZE, // 折角边长，与条目留白一致
  ...fontValue.value(),
  ...lineHeightValue.value(),
}));
</script>

<template>
  <!-- 色块主体由盒模型上色，折角只在右上角留白内绘制，不参与分片测量。 -->
  <div
    class="resume-item folded-label-item relative box-border"
    :class="{ 'resume-item--timeline': timeline }"
    :style="[boxStyle, fragmentStyle, itemStyle]"
  >
    <!-- 折角折片：右上角盖一层折角形状的暗面，点出折痕。 -->
    <span
      aria-hidden="true"
      class="folded-label-item__shade pointer-events-none absolute top-0 right-0"
    />
    <!-- 折起：折片下方翻出的亮面，与色块对比色一致，只覆盖首段。 -->
    <span
      v-if="decoration !== 'bottom' && decoration !== 'middle'"
      aria-hidden="true"
      class="folded-label-item__lift pointer-events-none absolute top-0 right-0"
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
/* 折片：用暗面收住右上角，折痕顺着标签语言走。 */
.folded-label-item__shade {
  width: var(--folded-item-fold);
  height: var(--folded-item-fold);
  background-color: color-mix(in srgb, var(--folded-item-accent) 62%, black 38%);
  clip-path: polygon(100% 0, 100% 100%, 0 0);
}

/* 折起：折片翻出的亮面，用对比色实心填充并在折痕一侧压暗，与标题色块的白字呼应。 */
.folded-label-item__lift {
  width: var(--folded-item-fold);
  height: var(--folded-item-fold);
  background-color: var(--folded-item-contrast);
  clip-path: polygon(0 0, 100% 100%, 0 100%);
  box-shadow: inset 1px 1px 0 0 color-mix(in srgb, var(--folded-item-accent) 55%, transparent);
}

/* 主体色块上的文字取对比色，续段沿用同一份颜色。 */
.folded-label-item {
  color: var(--folded-item-contrast);
}

/* 经历名称沿用标题的加粗与字距，和折角标签保持同一种文字节奏。 */
.folded-label-item :deep(> .flex:first-child > .min-w-0:first-child > .font-bold) {
  letter-spacing: 0.02em;
}
</style>
