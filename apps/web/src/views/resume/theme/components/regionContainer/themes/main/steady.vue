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
// 区域统一控制正文模块的轴线与间距，个人信息不参与轴线绘制。
const mainStyle = computed(() => ({
  "--timeline-rail-width": "144px", // 左侧日期栏宽度：标题、条目与轴线共用同一份
  "--steady-axis": themeColorLine.value, // 贯穿竖线颜色
  "--steady-node": themeColor.value, // 标题节点与条目节点颜色
  "--steady-module-gap": `${Number(ui.value?.page?.spacing?.module) || 0}px`, // 连接相邻正文模块的留白
}));
</script>

<template>
  <!-- 轴线仅覆盖正文模块容器及相邻正文模块间距，不进入个人信息区域。 -->
  <div
    class="resume-view-container steady-main relative box-border flex min-w-0 pt-5 pb-6"
    :style="mainStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 正文模块统一绘制标题、条目和段间距的轴线，明确排除个人信息。 */
.steady-main :deep(.resume-column > .resume-module-wrapper:not([data-module="user"]))::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--timeline-rail-width) - 24px);
  width: 1px;
  background-color: var(--steady-axis);
  pointer-events: none;
}

/* 仅从第二个正文模块起连接模块间距，首个正文模块不向个人信息延伸。 */
.steady-main :deep(.resume-column > .resume-module-wrapper:not([data-module="user"]) ~ .resume-module-wrapper:not([data-module="user"]))::before {
  top: calc(-1 * var(--steady-module-gap, 0px));
}
</style>
