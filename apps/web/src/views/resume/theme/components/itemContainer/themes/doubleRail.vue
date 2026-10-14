<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";

// 墨阶条目：不铺底色不描边，读数列给出日期，横杠刻度骑在轴线上，条目底部收一条账簿细线。
const props = defineProps({
  // 分片覆盖的块区间：续段不重复出现刻度
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
  // 是否为带日期栏的分组条目：只有分组条目才画刻度横杠
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目纵向留白：横杠与日期首行的对齐基准，与盒模型共用同一个值 */
const ITEM_PADDING = "9px";

// 所有条目都让出读数列，标题、正文与刻度共用同一套起始线。
const { fragmentStyle, boxStyle } = useItemBox(props, {
  radius: "0", // 条目不收圆角，保持直角刻度语言
  padding: ITEM_PADDING, // 条目四周留白
  reserveDateRail: true, // 无日期条目仍保留对齐空间
});
// 只有首个分片画横杠：跨页续段不重复出现节点。
const isItemStart = computed(
  () => !(props.blockRange.start > 0 || (props.contentRange?.start ?? 0) > 0),
);
// 只有末段分片收细线，续段之间不重复断行。
const isItemEnd = computed(() => props.decoration === "full" || props.decoration === "bottom");
</script>

<template>
  <div
    class="resume-item ink-item box-border relative"
    :class="{
      'resume-item--timeline': timeline,
      'ink-item--start': timeline && isItemStart,
      'ink-item--end': isItemEnd,
    }"
    :style="[boxStyle, fragmentStyle, { '--ink-item-padding': ITEM_PADDING }]"
  >
    <span v-if="timeline && isItemStart" aria-hidden="true" class="ink-item__tick" />
    <span v-if="isItemEnd" aria-hidden="true" class="ink-item__rule" />
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";

/* 读数列宽继承区域声明，横杠与轴线同位。 */
.ink-item.resume-item--timeline {
  --timeline-rail-width: inherit;
}

/* 贯穿轴线由区域层统一绘制，条目不再各画一段。 */
.ink-item.resume-item--timeline::before {
  display: none;
}

/* 横杠自读数列穿出跨过轴线，与日期首行垂直中心同线。 */
.ink-item__tick {
  position: absolute;
  top: calc(var(--ink-item-padding) + 0.5lh);
  left: calc(var(--timeline-rail-width) - 18px);
  width: 14px;
  height: 2px;
  background-color: var(--ink-tick);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* 账簿细线从轴线起笔延伸到栏右端，为每段经历收口。 */
.ink-item__rule {
  position: absolute;
  right: 0;
  bottom: 0;
  left: calc(var(--timeline-rail-width) - 18px);
  height: 1px;
  background-color: var(--ink-rule);
  pointer-events: none;
}

/* 日期用等宽数字右对齐贴向轴线，与横杠读成同一处刻度。 */
.ink-item :deep(.resume-timeline-date) {
  top: var(--ink-item-padding);
  width: calc(var(--timeline-rail-width) - 18px);
  color: var(--ink-tick);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  opacity: 1;
}

.ink-item :deep(.resume-timeline-date > span) {
  display: block;
  width: min-content;
  margin-left: auto;
  padding-right: var(--ink-rail-gap);
  text-align: right;
}
</style>
