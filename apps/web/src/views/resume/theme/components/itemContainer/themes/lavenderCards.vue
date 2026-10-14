<script setup>
import { computed } from "vue";
import { getItemFragmentStyle } from "@/views/resume/editor/preview/resumePages/render/itemStyle";

const props = defineProps({
  blockRange: { type: Object, default: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }) }, // 当前分片的内容块区间
  contentRange: { type: Object, default: undefined }, // 当前分片的正文区间
  decoration: { type: String, default: "full" }, // 当前分片的装饰阶段
  timeline: { type: Boolean, default: false }, // 是否预留时间轴日期栏
});
// 条目在真实根节点固定黑色，避免已保存的页面文字颜色覆盖白色卡片正文。
const fragmentStyle = computed(() => getItemFragmentStyle(props.blockRange, props.contentRange, props.decoration, "0"));
</script>

<template>
  <div
    class="resume-item box-border px-6 pb-6"
    :class="{ 'resume-item--timeline': timeline }"
    :style="[fragmentStyle, { color: '#000000' }]"
  >
    <slot />
  </div>
</template>
