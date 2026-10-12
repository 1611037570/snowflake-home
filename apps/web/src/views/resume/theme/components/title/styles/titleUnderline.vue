<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块的标题文字
});
const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 标题下沿补一条栏内细分隔线，与页眉细分隔线、双栏栏间线共用同一套线语言。 -->
  <h2
    class="top-user-title relative min-w-0 pb-3 font-bold tracking-wide break-words"
    :style="{ color: themeColor, '--top-user-title-line': themeColorLine }"
  >
    <TitleText :title="title" />
  </h2>
</template>

<style scoped>
/* 细分隔线用绝对定位绘制，不占标题盒高度，测量与渲染保持同一尺寸。 */
.top-user-title::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background-color: var(--top-user-title-line);
  pointer-events: none;
}

/* 线首的主题色短划压在细线上，强调标题起点并呼应栏间线。 */
.top-user-title::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 24px;
  height: 2px;
  background-color: currentColor;
  pointer-events: none;
}
</style>
