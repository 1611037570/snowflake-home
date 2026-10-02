<script>
// 正文留白由区域外观声明，分页与渲染读取同一份尺寸。
const regionPadding = {
  top: 18, // 正文顶部与上一区域之间的距离
  right: 0, // 右侧留白沿用页面设置
  bottom: 24, // 正文底部与页尾之间的留白
  left: 0, // 左侧留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
// 留白写在根元素的 padding 上，区域外观只额外提供贯穿竖线的公共变量
const mainStyle = computed(() => ({
  "--timeline-rail-width": "144px", // 左侧日期栏宽度：标题、条目与轴线共用同一份
  "--steady-axis": themeColorLine.value, // 贯穿竖线颜色
  "--steady-node": themeColor.value, // 标题节点与条目节点颜色
  "--steady-module-gap": `${Number(ui.value?.page?.spacing?.module) || 0}px`, // 模块间距：标题用它把轴线补齐到上一模块
}));
</script>

<template>
  <!-- 正文区域：留白交给区域容器，这里只声明留白并下发竖线变量 -->
  <div
    class="resume-view-container steady-main relative box-border flex min-w-0 pt-5 pb-6"
    :style="mainStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 页面第一个模块的标题不再向上补齐间距，避免轴线上方多出一截线头 */
.steady-main :deep(.resume-column > .resume-module-wrapper:first-of-type .steady-title::before) {
  top: 0;
}
</style>
