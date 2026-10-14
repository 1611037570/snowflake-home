<script setup>
import { computed } from "vue";
import { getItemFragmentStyle } from "@/views/resume/editor/preview/resumePages/render/itemStyle";

// 卡片类条目的公共底座：四周留白、跨页分片收边与日期栏类名只在这里实现一次。
const props = defineProps({
  blockRange: { type: Object, default: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }) }, // 当前分片的内容块区间
  contentRange: { type: Object, default: undefined }, // 当前分片的正文区间
  decoration: { type: String, default: "full" }, // 当前分片的装饰阶段
  timeline: { type: Boolean, default: false }, // 是否预留时间轴日期栏
});
// 续段收起重复留白，保持与公共条目分片规则一致。
const fragmentStyle = computed(() => getItemFragmentStyle(props.blockRange, props.contentRange, props.decoration, "0"));
</script>

<template>
  <!-- 正文留白由可测量的条目节点承担，卡片外框只绘制背景。 -->
  <div class="resume-item box-border px-6 pb-6" :class="{ 'resume-item--timeline': timeline }" :style="fragmentStyle"><slot /></div>
</template>
