<script setup>
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  blockRange: { type: Object, default: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }) }, // 分片块范围
  contentRange: { type: Object, default: undefined }, // 正文分片范围
  decoration: { type: String, default: "full" }, // 分片装饰阶段
  timeline: { type: Boolean, default: false }, // 左侧日期栏状态
});
// 条目保持白底无框，只为有日期的经历留出左栏。
const { fragmentStyle, boxStyle } = useItemBox(props, {
  radius: "0", // 条目方角
  padding: "0", // 条目不增加内边距
  backgroundColor: "transparent", // 沿用纸张白底
});
const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <div
    class="blue-square-line-item resume-item relative box-border"
    :class="{ 'resume-item--timeline': timeline }"
    :style="[boxStyle, fragmentStyle, { '--blue-square-line-color': themeColor }]"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";
/* 无导轨装饰：日期贴左缘与标题对齐，栏宽只容纳日期盒与正文间距。 */
.blue-square-line-item.resume-item--timeline { --timeline-rail-width: 154px; }
.blue-square-line-item.resume-item--timeline::before { display: none; }
.blue-square-line-item :deep(.resume-timeline-date) {
  width: 130px;
  color: var(--blue-square-line-color);
  opacity: 1;
  font-weight: 600;
}
</style>
