<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  // 当前模块标题文字
  title: {
    type: String,
    default: "",
  },
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 稳重标题：让出左侧日期栏，标题落在贯穿轴线上，与条目节点连成一条 -->
  <div
    class="steady-title relative flex items-center py-3"
    :style="{ paddingLeft: 'var(--timeline-rail-width)' }"
  >
    <div class="mr-3 h-3 w-3 shrink-0" :style="{ background: themeColor }"></div>
    <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style scoped>
/* 轴线向上补齐模块间距，使各模块的轴线连成一条；页面首个模块由区域外观截断 */
.steady-title::before {
  content: "";
  position: absolute;
  top: calc(-1 * var(--steady-module-gap, 0px));
  bottom: 0;
  left: calc(var(--timeline-rail-width) - 24px);
  width: 1px;
  background-color: var(--steady-axis);
  pointer-events: none;
}

/* 标题节点：模块起点用主题色小方块标记，落在轴线正中 */
.steady-title::after {
  content: "";
  position: absolute;
  top: 50%;
  left: calc(var(--timeline-rail-width) - 24px);
  width: 7px;
  height: 7px;
  border-radius: 2px;
  background-color: var(--steady-node, var(--steady-axis));
  transform: translate(-50%, -50%);
  pointer-events: none;
}
</style>
