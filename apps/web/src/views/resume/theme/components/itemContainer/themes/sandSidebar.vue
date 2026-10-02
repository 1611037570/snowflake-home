<script setup>
import { computed } from "vue";
import DefaultAppearance from "./default.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  blockRange: { // 分片覆盖的块区间
    type: Object, // 块区间对象
    default: () => ({
      start: 0, // 分片起始块位置
      end: Number.MAX_SAFE_INTEGER, // 分片结束块位置
    }), // 默认覆盖完整条目
  },
  contentRange: { type: Object, default: undefined }, // 分片覆盖的正文区间
  decoration: { type: String, default: "full" }, // 完整条目或跨页分片的装饰类型
  timeline: { type: Boolean, default: false }, // 是否保留时间轴日期栏
});
const { theme: { themeColor } } = useResumePreviewContext();
// 末尾留白只出现在完整条目或最后一段，复用默认条目的分片结构。
const complete = computed(() => props.decoration !== "top" && props.decoration !== "middle");
const itemStyle = computed(() => ({
  "--sand-item-accent": themeColor.value, // 经历名称使用的金棕色
  paddingBottom: complete.value ? "18px" : "0px", // 完成条目与分隔线之间的留白
}));
</script>

<template>
  <DefaultAppearance v-bind="props" class="sand-item relative" :data-item-complete="complete" :style="itemStyle">
    <slot />
  </DefaultAppearance>
</template>

<style scoped>
/* 条目头部仍复用名称、日期和副信息排列，只调整名称的颜色与字重。 */
.sand-item :deep(> .flex:first-child > .min-w-0:first-child > .font-bold) {
  color: var(--sand-item-accent);
  font-weight: 500;
}
</style>
