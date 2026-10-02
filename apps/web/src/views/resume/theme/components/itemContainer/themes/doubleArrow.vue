<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 双箭条目外观：左端双箭头引导标识 + 右缘箭头列，与模块标题的双三角语言同源。
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
  // 时间轴条目预留固定日期栏：本主题不使用日期栏
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目圆角：由外观自己声明，分片内外侧由共享规则裁剪 */
const ITEM_RADIUS = "0";
/** 条目纵向内边距：取 3 的倍数，同时作为右缘箭头列的重复节距 */
const ITEM_PADDING_Y = "12px";
/** 条目左内边距：为左端双箭头标识让位 */
const ITEM_PADDING_LEFT = "24px";
/** 条目右内边距：右缘箭头列的落位宽度，正文因此不会压到箭头 */
const ITEM_PADDING_RIGHT = "18px";

const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();

const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: `${ITEM_PADDING_Y} ${ITEM_PADDING_RIGHT}`,
  paddingLeft: ITEM_PADDING_LEFT,
  backgroundColor: "transparent",
  borderColor: "transparent",
});
// 首个分片才画引导标识与箭头列：续段只保留盒模型，跨页不会重复出现箭头
const isItemStart = computed(() => (props.blockRange?.start ?? 0) === 0);
// 箭头列只取主题色派生值，不写死色值
const itemStyle = computed(() => ({
  "--double-arrow-accent": themeColor.value, // 左端实心箭头与右缘箭头列的引导色
  "--double-arrow-line": themeColorLine.value, // 右缘箭头列的底衬线
  "--double-arrow-pad": ITEM_PADDING_Y, // 左端标识的纵向对齐基准，与条目留白同值
  "--double-arrow-rail-gap": ITEM_PADDING_Y, // 右缘箭头列的重复节距，与条目留白同值
  "--double-arrow-rail-right": `-${ITEM_PADDING_RIGHT}`, // 箭头列贴齐条目右缘、落在正文栏右边界上
}));
</script>

<template>
  <div
    class="resume-item double-arrow-item relative box-border"
    :style="[boxStyle, fragmentStyle, itemStyle]"
  >
    <slot />
    <!-- 描边层沿用共享分片规则：本主题不画描边，仅保留统一的盒模型结构 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
    <!-- 左端双箭头标识：两层同向箭头与标题的双三角同构，不挤压正文 -->
    <svg v-if="isItemStart" aria-hidden="true" class="double-arrow-item__mark" viewBox="0 0 14 18">
      <path d="M9 1L13 6.4L9 11.8Z" fill="var(--double-arrow-accent)" fill-opacity="0.42" />
      <path d="M1 5L5 10.4L1 15.8Z" fill="var(--double-arrow-accent)" />
    </svg>
    <!-- 右缘箭头列：重复的右向箭头串成引导条，贴在正文栏右边界 -->
    <span v-if="isItemStart" aria-hidden="true" class="double-arrow-item__rail" />
  </div>
</template>

<style scoped>
/* 左端标识与首行正文居中对齐，始终落在条目左内边距内。 */
.double-arrow-item__mark {
  position: absolute;
  top: calc(var(--double-arrow-pad) + 0.5lh);
  left: 3px;
  width: 14px;
  height: 18px;
  transform: translateY(-50%);
  pointer-events: none;
}

/* 箭头形状由遮罩给出，颜色仍取主题色变量，不使用固定色值。 */
.double-arrow-item__rail {
  position: absolute;
  top: 0;
  right: var(--double-arrow-rail-right);
  bottom: 0;
  width: 14px;
  background-color: var(--double-arrow-accent);
  -webkit-mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='12' viewBox='0 0 14 12'><path d='M3 2L7 6L3 10M7 2L11 6L7 10' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/></svg>");
  mask-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='12' viewBox='0 0 14 12'><path d='M3 2L7 6L3 10M7 2L11 6L7 10' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/></svg>");
  -webkit-mask-repeat: repeat-y;
  mask-repeat: repeat-y;
  -webkit-mask-size: 14px var(--double-arrow-rail-gap);
  mask-size: 14px var(--double-arrow-rail-gap);
  opacity: 0.26;
  pointer-events: none;
}

/* 箭头列底衬一条细线，把重复箭头串成一条贯穿条目的引导线。 */
.double-arrow-item__rail::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 1px;
  background-color: var(--double-arrow-line);
  opacity: 0.5;
}
</style>
