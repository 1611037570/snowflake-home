<script>
// 正文留白由区域外观声明，分页与真实渲染读取同一份尺寸，组件自身不再加内边距。
const regionPadding = {
  top: 12, // 正文与上一区域之间的距离
  right: 0, // 右侧留白沿用页面设置
  bottom: 0, // 底部留白沿用页面设置
  left: 0, // 左侧留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
// 正文只下发时间轴公共变量：轴线与节点按条目日期栏的宽度对齐
const timelineStyle = computed(() => ({
  "--timeline-axis": themeColorLine.value, // 贯穿轴线颜色：与模块标题、条目轴线共用
  "--timeline-node": themeColor.value, // 时间轴节点颜色：标题节点与条目首段节点共用
}));
</script>

<template>
  <!-- 正文区域：留白由区域容器统一管理，这里只声明留白并绘制贯穿时间轴 -->
  <div
    class="timeline-main resume-view-container relative box-border flex min-w-0"
    :style="timelineStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 时间轴底衬容器：轴线相对正文内容定位，不随区域留白变化 */
.timeline-main :deep(.resume-column) {
  position: relative;
}

/* 贯穿轴线画在日期栏与正文之间：起于首个模块节点，向下与标题、条目轴线连成一条 */
.timeline-main :deep(.resume-column)::after {
  content: "";
  position: absolute;
  top: 0.5lh;
  bottom: 0;
  left: calc(var(--timeline-rail-width, 144px) - 18px);
  width: 1px;
  background-color: var(--timeline-axis);
  pointer-events: none;
}
</style>
