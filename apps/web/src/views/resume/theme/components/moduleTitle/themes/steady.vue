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
  <!-- 稳重标题只绘制模块节点，贯穿轴线由正文栏容器统一绘制。 -->
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
