<script setup>
import { useItemBox } from "../useItemBox";

const props = defineProps({
  blockRange: { type: Object, default: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }) }, // 当前分片块区间
  contentRange: { type: Object, default: undefined }, // 当前分片正文区间
  decoration: { type: String, default: "full" }, // 当前分片装饰阶段
  timeline: { type: Boolean, default: false }, // 公共时间轴状态
});
// 正文只保留条目留白，不绘制外框。
const { fragmentStyle, boxStyle } = useItemBox(props, {
  radius: "0", // 条目保持直角
  padding: "6px", // 正文留白
});
</script>

<template>
  <div class="resume-item box-border min-w-0" :class="{ 'resume-item--timeline': timeline }" :style="[boxStyle, fragmentStyle]"><slot /></div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";
</style>
