<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";

// 细线刻度条目：与默认条目共用盒模型，日期栏与正文缩进由时间轴能力决定。
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
  // 是否为带日期栏的分组条目：只有分组条目才画刻度
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目纵向留白：刻度与日期首行的对齐基准，与盒模型共用同一个值 */
const ITEM_PADDING = "9px";

// 所有条目都让出日期栏，无日期的正文仍与经历正文同一条起始线。
const { fragmentStyle, boxStyle } = useItemBox(props, {
  radius: "0", // 条目不绘制圆角
  padding: ITEM_PADDING, // 条目四周留白
  reserveDateRail: true, // 无日期条目仍保留对齐空间
});
// 只有首个分片画刻度：跨页续段不重复出现节点。
const isItemStart = computed(
  () => !(props.blockRange.start > 0 || (props.contentRange?.start ?? 0) > 0),
);
const nodeStyle = { "--hairline-item-padding": ITEM_PADDING };
</script>

<template>
  <div
    class="resume-item hairline-item box-border relative"
    :class="{
      'resume-item--timeline': timeline,
      'hairline-item--start': timeline && isItemStart,
    }"
    :style="[boxStyle, fragmentStyle, nodeStyle]"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";

/* 日期栏宽继承区域声明，刻度与模块竖线落在同一位置。 */
.hairline-item.resume-item--timeline {
  --timeline-rail-width: inherit;
}

/* 贯穿轴线由区域绘制，条目不再重复画线。 */
.hairline-item.resume-item--timeline::before {
  display: none;
}

/* 短刻度骑在轴线上，与日期首行居中对齐。 */
.hairline-item--start::after {
  content: "";
  position: absolute;
  top: calc(var(--hairline-item-padding) + 0.5lh);
  left: calc(var(--timeline-rail-width) - 18px);
  width: 9px;
  height: 2px;
  border-radius: 9999px;
  background-color: var(--hairline-node);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* 日期收向轴线一侧，与刻度形成同一 reading 列。 */
.hairline-item :deep(.resume-timeline-date) {
  top: var(--hairline-item-padding);
  color: var(--hairline-node);
  opacity: 0.9;
}

.hairline-item :deep(.resume-timeline-date > span) {
  display: block;
  width: min-content;
  margin-left: auto;
  padding-right: 12px;
  text-align: right;
}
</style>
