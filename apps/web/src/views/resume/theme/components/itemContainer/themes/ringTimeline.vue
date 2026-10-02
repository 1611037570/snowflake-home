<script>
// 圆环时间轴条目需要左侧日期栏：能力由外观组件自己声明，分发器不再维护主题名单。
const usesDateRail = true;
export default { usesDateRail };
</script>

<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";

// 圆环时间轴条目外观：与默认条目共用盒模型，额外固定启用日期栏。
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
  // 是否为带日期栏的分组条目：只有分组条目才画空心圆环
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目纵向留白：圆环与日期首行的对齐基准，与盒模型共用同一个值 */
const ITEM_PADDING = "12px";

// 所有条目都让出时间轴栏，标题与正文因此共用同一条起始线；日期栏仍只出现在分组条目上
const { fragmentStyle, boxStyle } = useItemBox(props, {
  radius: "0",
  padding: ITEM_PADDING,
  timeline: true,
});
// 首个分片才画圆环：续段由分片区间判断，跨页不会重复出现节点
const isItemStart = computed(
  () => !(props.blockRange.start > 0 || (props.contentRange?.start ?? 0) > 0),
);
const nodeStyle = { "--ring-item-padding": ITEM_PADDING };
</script>

<template>
  <div
    class="resume-item ring-timeline-item box-border relative"
    :class="{
      'resume-item--timeline': timeline,
      'ring-timeline-item--start': timeline && isItemStart,
    }"
    :style="[boxStyle, fragmentStyle, nodeStyle]"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 轴线按条目整高绘制：相邻条目、标题补齐的线段在模块间距处自然衔接 */
.ring-timeline-item::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--timeline-rail-width) - 18px);
  width: 1px;
  background-color: var(--ring-line);
  pointer-events: none;
}

/* 模块首段的轴线向上补齐模块间距：模块没有标题时轴线依然连续 */
.ring-timeline-item--start::before {
  top: calc(-1 * var(--ring-module-gap));
}

/* 空心圆环：与日期首行居中对齐，内圈用纸张底色压住轴线 */
.ring-timeline-item--start::after {
  content: "";
  position: absolute;
  top: calc(var(--ring-item-padding) + 0.5lh);
  left: calc(var(--timeline-rail-width) - 18px);
  box-sizing: border-box;
  width: 9px;
  height: 9px;
  border: 1.5px solid var(--ring-node);
  border-radius: 9999px;
  background-color: var(--ring-paper);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* 日期栏顶到内容首行：条目上内边距由外观声明，日期需要同量下移才能与标题居中对齐 */
.ring-timeline-item :deep(.resume-timeline-date) {
  top: var(--ring-item-padding);
  color: var(--ring-node);
  font-weight: 600;
  opacity: 1;
}

/* 日期贴向轴线一侧换行，日期栏的留白落在文字与正文之间 */
.ring-timeline-item :deep(.resume-timeline-date > span) {
  display: block;
  width: min-content;
  margin-left: auto;
  text-align: right;
}
</style>
