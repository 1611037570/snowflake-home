<script>
// 稳重条目外观需要左侧日期栏：能力由外观组件自己声明，日期固定在左侧列内
const usesDateRail = true;
export default { usesDateRail };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { useItemBox } from "../useItemBox";

// 稳重条目外观：复用统一盒模型，日期留在左侧列，贯穿竖线由条目整高画出
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
  // 是否为带日期栏的分组条目：与外观声明保持一致
  timeline: {
    type: Boolean,
    default: true,
  },
});

/** 条目四周内边距：留白只由盒模型声明，竖线不参与排版 */
const ITEM_PADDING = "12px";
/** 左侧日期栏宽度：与标题组件和区域组件保持同一份宽度 */
const RAIL_WIDTH = "144px";
/** 竖线相对正文起始线的回退距离：轴线落在日期列与正文之间 */
const AXIS_BACK = "24px";

const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
// 留白、圆角与跨页分片收边全部交给共享盒模型，日期栏宽度由外观自己声明
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: "0",
  padding: ITEM_PADDING,
  timeline: true,
});
const itemStyle = {
  "--timeline-rail-width": RAIL_WIDTH, // 日期栏宽度：日期、轴线和正文起始线共用
  "--steady-axis": themeColorLine.value, // 贯穿竖线颜色
  "--steady-node": themeColor.value, // 条目节点颜色
  "--steady-axis-back": AXIS_BACK, // 竖线相对正文起始线的退让距离
};
// 条目首段才落节点：跨页续段由分片区间判断，避免同一段经历重复出现节点
const isItemStart = computed(
  () => !(props.blockRange.start > 0 || (props.contentRange?.start ?? 0) > 0),
);
</script>

<template>
  <!-- 条目让出左侧日期栏，整条轴线随条目高度延伸，相邻条目自然连成一条 -->
  <div
    class="resume-item resume-item--timeline steady-item relative box-border"
    :class="{ 'steady-item--start': isItemStart }"
    :style="[boxStyle, fragmentStyle, itemStyle]"
  >
    <slot />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
  </div>
</template>

<style scoped>
/* 覆盖默认条目的半透明轴线：贯穿线改用主题线的稳定配色 */
.steady-item::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--timeline-rail-width) - var(--steady-axis-back));
  width: 1px;
  border-left: none;
  background-color: var(--steady-axis);
  opacity: 1;
  pointer-events: none;
}

/* 条目首段在轴线上落一个实心节点：上移量为条目内边距加半个行高，与日期首行居中 */
.steady-item--start::after {
  content: "";
  position: absolute;
  top: calc(0.5lh + 12px);
  left: calc(var(--timeline-rail-width) - var(--steady-axis-back));
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background-color: var(--steady-node);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* 日期固定在左侧列，贴向轴线一侧并与节点对齐 */
.steady-item :deep(.resume-timeline-date) {
  right: calc(var(--steady-axis-back) + 12px);
  left: 0;
  width: auto;
  justify-content: flex-end;
  font-weight: 600;
  opacity: 1;
}

/* 日期保持单行，超出日期栏时缩排而不挤压正文 */
.steady-item :deep(.resume-timeline-date > span) {
  white-space: nowrap;
}
</style>
