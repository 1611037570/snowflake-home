<script>
// 斜纹飘带条目不使用左侧日期栏，日期仍跟随正文头部的日期位置设置。
const usesDateRail = false;
export default { usesDateRail };
</script>

<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 斜纹飘带条目外观：条目标题带一道细斜纹，正文栏铺淡斜纹底，延续标题的斜纹母题。
// 圆角、留白与分片收边全部由共享盒模型给出，外观只声明数值与配色。
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
/** 条目四周留白：斜纹装饰都由绝对定位绘制，不额外占高 */
const ITEM_PADDING = "12px";
/** 条目左侧留白：给条目标题前的细斜纹留出落位 */
const ITEM_PADDING_LEFT = "18px";
/** 斜纹水平周期：正文栏与条目标题的斜纹共用同一份疏密 */
const STRIPE_SPAN = "8px";

const {
  theme: { themeColor, themeColorSoft },
} = useResumePreviewContext();

// 盒模型、分片收边与日期栏统一由共享钩子计算，渲染与测量得到同一份尺寸。
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: ITEM_PADDING,
  paddingLeft: ITEM_PADDING_LEFT,
  backgroundColor: "transparent",
  borderColor: "transparent",
});

// 正文栏淡斜纹底只在完整条目或末段收口，续段不重复画分隔线。
const complete = computed(() => props.decoration !== "top" && props.decoration !== "middle");
const itemStyle = computed(() => ({
  "--striped-item-accent": themeColor.value, // 条目标题前的细斜纹使用主题色
  "--striped-item-stripe": `color-mix(in srgb, ${themeColor.value} 8%, transparent)`, // 正文栏淡斜纹底，主题色 8%
  "--striped-item-line": themeColorSoft.value, // 条目之间的分隔线，主题色 10%
  "--striped-item-span": STRIPE_SPAN, // 斜纹水平周期，与条目标题斜纹保持一致
}));
</script>

<template>
  <!-- 条目自身作为定位基准，斜纹图层不会越到相邻条目上 -->
  <div
    class="resume-item striped-ribbon-item relative box-border"
    :style="[boxStyle, fragmentStyle, itemStyle]"
  >
    <!-- 正文栏淡斜纹底：左右各外扩一点，斜纹在条目边缘处自然收住 -->
    <span aria-hidden="true" class="striped-ribbon-item__field pointer-events-none absolute inset-y-0 -right-1.5 -left-1.5" />
    <slot />
    <!-- 描边复用共享分片规则：续段自动收起上下边，常态下只留一条分隔线 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
    <!-- 末段收口线：与下一条目拉开一层斜纹间距，不占用任何内边距 -->
    <span
      v-if="complete"
      aria-hidden="true"
      class="striped-ribbon-item__rule pointer-events-none absolute -right-1.5 -bottom-1.5 -left-1.5"
    />
  </div>
</template>

<style scoped>
/* 正文栏淡斜纹底：斜纹自左上向右下倾斜，与标题的斜边方向同向 */
.striped-ribbon-item__field {
  background-image: repeating-linear-gradient(
    135deg,
    var(--striped-item-stripe) 0,
    var(--striped-item-stripe) 2px,
    transparent 2px,
    transparent var(--striped-item-span)
  );
}

/* 末段收口线：用最浅一层主题色收住条目，替代完整的底部描边 */
.striped-ribbon-item__rule {
  height: 1px;
  background-color: var(--striped-item-line);
  opacity: 0.6;
}

/* 条目标题前的细斜纹：与标题折角同向，只占装饰宽度不挤压正文 */
.striped-ribbon-item :deep(> .flex:first-child > .min-w-0:first-child) {
  position: relative;
}

.striped-ribbon-item :deep(> .flex:first-child > .min-w-0:first-child)::before {
  content: "";
  position: absolute;
  top: 0.4lh;
  left: -12px;
  width: 4px;
  height: 1em;
  background: var(--striped-item-accent);
  transform: skewX(-18deg);
  pointer-events: none;
}

/* 条目名称沿用标题的中等字重与主题色，与细斜纹连成同一套语言 */
.striped-ribbon-item :deep(> .flex:first-child > .min-w-0:first-child > .font-bold) {
  color: var(--striped-item-accent);
  font-weight: 600;
}
</style>
