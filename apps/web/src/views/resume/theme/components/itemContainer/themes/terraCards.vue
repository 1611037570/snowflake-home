<script setup>
import { computed } from "vue";
import { getItemFragmentStyle } from "@/views/resume/editor/preview/resumePages/render/itemStyle";

const props = defineProps({
  blockRange: { type: Object, default: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }) }, // 分片块区间
  contentRange: { type: Object, default: undefined }, // 分片正文区间
  decoration: { type: String, default: "full" }, // 分片装饰阶段
  timeline: { type: Boolean, default: false }, // 公共日期栏状态
});
// 条目内边距随分片阶段收边，测量与预览共用同一盒模型。
const fragmentStyle = computed(() =>
  getItemFragmentStyle(props.blockRange, props.contentRange, props.decoration, "0"),
);
</script>

<template>
  <div class="resume-item box-border px-6 pb-6" :class="{ 'resume-item--timeline': timeline }" :style="fragmentStyle">
    <slot />
  </div>
</template>
