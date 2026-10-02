<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 模块显示标题
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 时间轴模块标题：标题文字让出左侧日期栏，节点落在贯穿轴线上作为模块起点 -->
  <div
    class="timeline-title relative overflow-hidden border-b-2 pb-3"
    :style="{ borderColor: themeColor }"
  >
    <h2 class="ml-36 font-bold tracking-wide break-words">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style scoped>
/* 标题节点：画在日期栏与正文之间的轴线上，与条目首段节点同宽，标记模块起点 */
.timeline-title::after {
  content: "";
  position: absolute;
  top: 50%;
  left: calc(var(--timeline-rail-width, 144px) - 18px);
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background-color: var(--timeline-node, currentColor);
  transform: translate(-50%, -50%);
  pointer-events: none;
}
</style>
