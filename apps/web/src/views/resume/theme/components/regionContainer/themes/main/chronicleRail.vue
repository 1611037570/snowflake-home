<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { ui } = useResumePreviewContext();

// 与页眉外观共用同一组烫金配色，窄栏底色压在纸色之上。
const GOLD = "#A9824A";
const railStyle = computed(() => ({
  "--timeline-rail-width": "108px", // 宽栏日期栏连同正文缩进的宽度
  "--chronicle-gold": GOLD, // 节点描边金
  "--chronicle-line": `color-mix(in srgb, ${GOLD} 55%, transparent)`, // 贯穿轴线颜色
  "--chronicle-node": GOLD, // 菱形节点描边与日期文字取色
  "--chronicle-paper": ui.value?.page?.background || "#FFFFFF", // 菱形内圈取纸张底色压住轴线
  "--chronicle-side-tint": `color-mix(in srgb, ${GOLD} 5%, ${ui.value?.page?.background || "#FFFFFF"})`, // 窄栏浅底
  "--chronicle-region-gap": `${Number(ui.value?.page?.spacing?.module) || 0}px`, // 页眉与正文区域之间的容器间距，窄栏底板上移补齐用
  "--ring-node": GOLD, // 公共缩进标题的节点颜色
}));
</script>

<template>
  <!-- 只绘制轴线与窄栏底板，栏宽与留白仍由公共区域容器结算。 -->
  <div class="chronicle-main isolate" :style="railStyle">
    <slot />
  </div>
</template>

<style scoped>
/* 宽栏承载贯穿轴线，节点与标题圆点都落在这条线上。 */
.chronicle-main :deep(> [data-resume-column="left"] > [data-resume-column-content]) {
  position: relative;
}

.chronicle-main :deep(> [data-resume-column="left"] > [data-resume-column-content])::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--timeline-rail-width) - 18px);
  width: 1px;
  background-color: var(--chronicle-line);
  pointer-events: none;
}

/* 窄栏铺一层暖底，向右铺到纸边并停在页尾留白之上。 */
.chronicle-main :deep(> [data-resume-column="right"]) {
  isolation: isolate;
}

.chronicle-main :deep(> [data-resume-column="right"])::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * (var(--resume-region-inset-top, 0px) + var(--chronicle-region-gap, 0px))); /* 上移补齐区域间距，让窄栏底色顶到页眉收尾金线 */
  right: calc(-1 * var(--resume-page-inset-horizontal, 0px));
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  left: 0; /* 窄栏底色从两栏交界的中缝开始 */
  background-color: var(--chronicle-side-tint);
  pointer-events: none;
}

/* 窄栏没有日期栏：栏宽收起，日期回到条目头部行内排版。 */
.chronicle-main :deep(> [data-resume-column="right"]) {
  --timeline-rail-width: 0px; /* 条目不再为日期栏缩进 */
  --ring-node: transparent; /* 窄栏标题不画轴线圆点 */
  --chronicle-node-size: 0px; /* 窄栏条目不画菱形节点 */
  --chronicle-date-position: static; /* 日期随条目头部行排布 */
  --chronicle-date-width: auto; /* 日期宽度由头部行决定 */
  --chronicle-date-color: inherit; /* 窄栏日期改用正文墨色 */
  --chronicle-date-tail: 0px; /* 窄栏日期不额外留尾部空隙 */
}
</style>
