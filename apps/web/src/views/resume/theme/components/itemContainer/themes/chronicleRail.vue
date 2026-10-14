<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";

// 岁序条目外观：宽栏把日期收进烫金时间轴栏，窄栏让日期回到条目头部行内。
const props = defineProps({
  // 分片覆盖的块区间：续段不补上内边距，也不重复画节点
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
  // 是否为带日期栏的分组条目：只有分组条目才画菱形节点
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目纵向留白：菱形节点与日期首行的对齐基准，与盒模型共用同一个值 */
const ITEM_PADDING = "12px";

// 所有条目都让出时间轴栏，标题、日期与正文共用同一条起始线。
const { fragmentStyle, boxStyle } = useItemBox(props, {
  radius: "0", // 条目不绘制圆角
  padding: ITEM_PADDING, // 条目四周留白
  reserveDateRail: true, // 无日期条目仍保留对齐空间
});
// 首个分片才画节点：跨页续段不重复出现。
const isItemStart = computed(
  () => !(props.blockRange.start > 0 || (props.contentRange?.start ?? 0) > 0),
);
const nodeStyle = { "--chronicle-item-padding": ITEM_PADDING };
</script>

<template>
  <div
    class="resume-item chronicle-item box-border relative"
    :class="{
      'resume-item--timeline': timeline,
      'chronicle-item--start': timeline && isItemStart,
    }"
    :style="[boxStyle, fragmentStyle, nodeStyle]"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";

/* 日期栏宽继承区域声明，菱形节点与模块轴线落在同一位置。 */
.chronicle-item.resume-item--timeline {
  --timeline-rail-width: inherit;
}

/* 贯穿轴线由区域绘制，条目不再逐条补线。 */
.chronicle-item.resume-item--timeline::before {
  display: none;
}

/* 菱形描金节点：骑在轴线上与日期首行居中对齐，内圈用纸张底色压住轴线。 */
.chronicle-item--start::after {
  content: "";
  position: absolute;
  top: calc(var(--chronicle-item-padding) + 0.5lh);
  left: calc(var(--timeline-rail-width) - 18px);
  box-sizing: border-box;
  width: var(--chronicle-node-size, 9px);
  height: var(--chronicle-node-size, 9px);
  border: 1.5px solid var(--chronicle-node);
  background-color: var(--chronicle-paper);
  transform: translate(-50%, -50%) rotate(45deg);
  pointer-events: none;
}

/* 日期落在时间轴栏内，等宽数字让多段经历竖向对齐。 */
.chronicle-item :deep(.resume-timeline-date) {
  position: var(--chronicle-date-position, absolute);
  top: var(--chronicle-item-padding);
  left: 0;
  width: var(--chronicle-date-width, calc(var(--timeline-rail-width) - 24px));
  color: var(--chronicle-date-color, var(--chronicle-node));
  font-weight: 600;
  opacity: 1;
  font-variant-numeric: tabular-nums;
}

/* 日期贴向轴线一侧收束，栏内余量落在文字与正文之间。 */
.chronicle-item :deep(.resume-timeline-date > span) {
  display: block;
  width: min-content;
  margin-left: auto;
  padding-right: var(--chronicle-date-tail, 12px);
  text-align: right;
}
</style>
