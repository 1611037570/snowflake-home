<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 极简条目外观：条目之间只用留白分层，日期收成一列对齐。
// 底色、圆角与描边全部透明，分片收边与留白仍由共享盒模型给出。
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
  // 时间轴条目预留固定日期栏：极简条目不使用日期栏
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目内边距：三边同值，条目之间因此保持等距的留白节奏 */
const ITEM_PADDING = "18px";
/** 完成条目与下一条之间的呼吸留白：只加在条目末尾，续段不重复叠加 */
const ITEM_GAP = "12px";
/** 日期列宽：右对齐的日期在多个条目之间收成同一列 */
const DATE_COLUMN_WIDTH = "90px";

const {
  ui,
  theme: { datePosition, dateStyle, themeColorLine },
} = useResumePreviewContext();
// 盒模型只声明留白：底色透明、描边透明，装饰全部交给伪元素
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: "0",
  padding: ITEM_PADDING,
  paddingLeft: ITEM_PADDING,
  backgroundColor: "transparent",
  borderColor: "transparent",
});
// 极细底线只出现在条目的最后一个分片：续段不会在页首重复画线
const complete = computed(() => props.decoration !== "top" && props.decoration !== "middle");
// 双栏版式下不绘制日期列装饰，单栏才按日期位置对齐日期
const isSingleColumn = computed(() => {
  const type = ui.value?.layout?.type;
  return type !== "twoColumn" && type !== "topUserTwoColumn";
});
// 日期靠右时把日期文字收成固定列，日期靠左时保持原样，不做覆盖
const isDateColumn = computed(() => isSingleColumn.value && datePosition.value !== "left");
// 留白与线条色通过 CSS 变量下发给样式表，避免两处各写一份数值与色值
const itemStyle = computed(() => ({
  "--minimal-item-padding": ITEM_PADDING, // 条目内边距，末尾底线按同一数值向内收
  "--minimal-item-gap": ITEM_GAP, // 完成条目末尾的分层留白
  "--minimal-date-column": DATE_COLUMN_WIDTH, // 日期列宽
  "--minimal-item-line": themeColorLine.value, // 末尾极细底线与日期列虚线的线条色
}));
</script>

<template>
  <div
    class="resume-item minimal-item box-border relative"
    :data-item-complete="complete"
    :data-date-column="isDateColumn"
    :data-date-style="dateStyle"
    :style="[boxStyle, fragmentStyle, itemStyle]"
  >
    <slot />
    <!-- 分片边框沿用共享规则收起，极简外观保持透明 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
  </div>
</template>

<style scoped>
/* 完成条目的末尾用一条极细底线收尾，线条绝对定位，不占用测量高度 */
.minimal-item[data-item-complete="true"]::after {
  content: "";
  position: absolute;
  right: var(--minimal-item-padding);
  bottom: 0;
  left: var(--minimal-item-padding);
  height: 1px;
  background-color: color-mix(in srgb, var(--minimal-item-line) 50%, transparent);
  pointer-events: none;
}

/* 条目末尾的留白只加在完成条目上：跨页续段不会把留白重复带进下一页 */
.minimal-item[data-item-complete="true"] {
  padding-bottom: calc(var(--minimal-item-padding) + var(--minimal-item-gap));
}

/* 日期收成固定宽度的右对齐列：首行最后一个子块即日期容器，多个条目的日期对齐在同一竖直线上 */
.minimal-item[data-date-column="true"]
  :deep(.flex:first-child > .flex:last-child:not(:first-child)) {
  justify-content: flex-end;
  box-sizing: border-box;
  min-width: var(--minimal-date-column);
  /* 名称与日期之间补一条极细虚线，弱化分隔感又不引入任何色块 */
  border-left: 1px dashed color-mix(in srgb, var(--minimal-item-line) 40%, transparent);
  padding-left: 12px;
}
</style>
