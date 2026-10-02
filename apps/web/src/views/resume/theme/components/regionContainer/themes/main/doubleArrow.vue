<script>
// 正文留白由外观组件声明，分页与组件读取同一份尺寸；留白由引擎容器按 regionPadding 自动施加。
const regionPadding = {
  top: 0, // 正文顶部留白由页面设置与模块间距负责
  right: 0, // 正文右侧留白由页面设置负责，组件不再叠加内边距
  bottom: 0, // 正文底部留白由页面设置负责
  left: 0, // 正文左侧留白由页面设置负责
};
export default {
  regionPadding, // 分页与组件共用的正文留白
};
</script>

<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 正文栏右缘一条贯穿引导线，与条目右缘的箭头列首尾衔接。 -->
  <div
    class="resume-view-container double-arrow-main relative box-border flex min-w-0"
    :style="{ '--double-arrow-region-accent': themeColor, '--double-arrow-region-line': themeColorLine }"
  >
    <span aria-hidden="true" class="double-arrow-main__guide" />
    <slot />
  </div>
</template>

<style scoped>
/* 引导线落在正文栏右边界：水平位置跟随引擎施加的容器内边距，不额外占用排版宽度。 */
.double-arrow-main__guide {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 1px;
  background-color: var(--double-arrow-region-line);
  opacity: 0.5;
  pointer-events: none;
}

/* 引导线上端的双箭头收口：两层同向箭头呼应模块标题的双三角。 */
.double-arrow-main__guide::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 16px;
  background-color: var(--double-arrow-region-accent);
  clip-path: polygon(
    0 0,
    62% 0,
    100% 50%,
    62% 100%,
    0 100%,
    38% 50%
  );
  transform: translateY(-100%);
}
</style>
