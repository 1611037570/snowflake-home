<script setup>
import { useItemBox } from "../useItemBox";

const props = defineProps({
  blockRange: { type: Object, default: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }) }, // 当前分片的块范围
  contentRange: { type: Object, default: undefined }, // 当前分片的文本范围
  decoration: { type: String, default: "full" }, // 分片装饰阶段
  timeline: { type: Boolean, default: false }, // 公共条目接口的日期栏标记
});

// 借用时间轴条目的栏位内缩方式，让正文与左侧模块标题同行对齐。
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: "0", // 条目不绘制圆角
  paddingLeft: "var(--architect-rail-width)", // 正文起点对齐标题栏右侧
});
</script>

<template>
  <div class="resume-item box-border" :class="{ 'resume-item--timeline': timeline }" :style="[boxStyle, fragmentStyle]">
    <slot />
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 box-border border" :style="borderStyle" />
  </div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";
</style>
