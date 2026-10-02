<script>
// 条目需要左侧固定日期栏：能力由外观组件自己声明，分发器据此把日期移入预留列。
const usesDateRail = true;
export default { usesDateRail };
</script>

<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

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
  // 是否为带日期栏的分组条目：此处恒为真，保留入参以便与默认外观同签名
  timeline: {
    type: Boolean,
    default: true,
  },
});

const {
  theme: { themeColor, themeColorLine, lineHeightValue },
} = useResumePreviewContext();
// 条目统一留白：四个方向同值，续段的上内边距由分片样式归零，避免跨页多出一段空白。
const ITEM_PADDING = "12px";
// 预留列宽度：右侧留出 12px 间距后为日期文字宽度，非分组条目也据此与分组条目左对齐。
const ITEM_RAIL_WIDTH = "96px";

const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: "0", // 条目不做圆角，左侧细条需要保持直边
  padding: ITEM_PADDING, // 条目四周内边距
  paddingLeft: "0px", // 日期栏启用时以固定预留列代替左内边距
  borderColor: themeColorLine.value, // 分片描边色：主题色 40%，避免与左侧细条抢视觉
  timeline: true, // 分组与非分组条目都让出同一列，保证全篇起始线一致
});

// 条目左侧细条与区域贯穿细条同色，条目只负责自己那一段。
const railStyle = computed(() => ({
  "--modern-item-rail": themeColor.value, // 条目左侧细条颜色
  "--timeline-rail-width": ITEM_RAIL_WIDTH, // 日期预留列宽度，分页与渲染共用
  ...lineHeightValue.value(), // 条目内文字沿用页面行高，日期与正文首行同高
}));
// 细条宽度与区域细条一致，缩进后与正文起始线形成固定间距。
const railWidthStyle = { borderLeftWidth: "3px", borderLeftStyle: "solid" };
</script>

<template>
  <!-- 盒模型留白与分片收边全部来自 useItemBox，日期列宽度由变量下发给分片内容 -->
  <div
    class="resume-item box-border bg-transparent"
    :class="{ 'resume-item--timeline': timeline }"
    :style="[boxStyle, fragmentStyle, railWidthStyle, railStyle]"
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
/* 左侧细条与定位基准都由条目自身承担，日期绝对定位在预留列内 */
.resume-item {
  position: relative;
  border-left-color: var(--modern-item-rail);
}

/* 日期贴向预留列右沿，与正文左沿之间留出固定间距 */
.resume-item :deep(.resume-timeline-date) {
  top: 0;
  right: calc(var(--timeline-rail-width) - 12px);
  left: 0;
  width: auto;
  color: var(--modern-item-rail);
  opacity: 0.75;
}

/* 日期右对齐成一列，跨页续段也不会把日期挤进正文 */
.resume-item :deep(.resume-timeline-date > span) {
  display: block;
  text-align: right;
}
</style>
