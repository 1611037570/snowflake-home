<script>
// 时间轴条目外观需要左侧日期栏：能力由外观组件自己声明，分发器不再维护主题名单。
const usesDateRail = true;
export default { usesDateRail };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { useItemBox } from "../useItemBox";

// 时间轴条目外观：与默认条目同一份盒模型，额外固定启用日期栏，日期列宽度由 CSS 变量提供。
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
  // 时间轴条目预留固定日期栏，此处恒为真，保留入参以便与默认外观同签名
  timeline: {
    type: Boolean,
    default: true,
  },
});

const {
  theme: { themeColor, themeColorLine, themeColorSoft },
} = useResumePreviewContext();
// 留白、圆角与分片收边全部交给共享盒模型，日期栏宽度由盒模型按 CSS 变量让出
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: "0",
  padding: "0px", // 时间轴条目上下不留白，日期首行与标题首行自然对齐
  paddingLeft: "var(--timeline-rail-width)", // 非分组条目也让出日期栏，正文与时间轴条目共用同一条起始线
  backgroundColor: "transparent", // 条目自身不加底色，正文区底衬由区域外观绘制
  borderColor: "transparent", // 条目不描边，分隔只用轴线与节点表达
});
// 节点与轴线配色由条目自己声明，与区域外观共用同一批变量名
const itemStyle = {
  "--timeline-axis": themeColorLine.value, // 贯穿轴线颜色
  "--timeline-node": themeColor.value, // 条目首段节点颜色
  "--timeline-date-tint": themeColorSoft.value, // 日期文字底色
};
// 条目首段才落节点：跨页续段由分片区间判断，避免同一段经历重复出现节点
const isItemStart = computed(
  () => !(props.blockRange.start > 0 || (props.contentRange?.start ?? 0) > 0),
);
</script>

<template>
  <!-- 条目让出左侧日期栏，首段在轴线上落节点，续段只延长轴线 -->
  <div
    class="resume-item resume-item--timeline timeline-item box-border"
    :class="{ 'timeline-item--start': isItemStart }"
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
@use "./itemBase.scss";

/* 贯彻轴线改用主题线配色：与正文区域的轴线同色，模块之间不出现色差 */
.timeline-item::before {
  border-left-color: var(--timeline-axis);
  opacity: 1;
}

/* 条目首段在轴线上落实心节点：位于日期首行中线，与模块标题节点连成同一条时间轴 */
.timeline-item--start::after {
  content: "";
  position: absolute;
  top: 0.5lh;
  left: calc(var(--timeline-rail-width) - 18px);
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background-color: var(--timeline-node);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* 日期贴向轴线一侧排列，并在日期栏内用浅底色标出与轴线的关系 */
.timeline-item :deep(.resume-timeline-date) {
  right: 18px;
  left: 0;
  width: auto;
  justify-content: flex-end;
  border-radius: 6px;
  background-color: var(--timeline-date-tint);
  color: var(--timeline-node);
  font-weight: 600;
  opacity: 1;
}

/* 日期保持单行，超出日期栏时缩排而不挤压正文 */
.timeline-item :deep(.resume-timeline-date > span) {
  white-space: nowrap;
}
</style>
