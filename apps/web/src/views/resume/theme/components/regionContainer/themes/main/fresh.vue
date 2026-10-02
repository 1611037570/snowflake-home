<script>
// 正文留白由外观组件维护，分页从组件导出读取同一份尺寸；引擎容器已按此留白加内边距，组件不再写留白类。
const regionPadding = {
  top: 24, // 正文内容距圆角底板内沿的上留白
  right: 27, // 正文内容距圆角底板内沿的右留白
  bottom: 24, // 正文内容距圆角底板内沿的下留白
  left: 27, // 正文内容距圆角底板内沿的左留白
};
export default {
  regionPadding, // 分页与组件共用的正文留白
};
</script>

<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 清新正文区域：柔和圆角浅底托，装饰只走伪元素，不额外包裹内容层 -->
  <div class="fresh-main box-border w-full" :style="{ '--fresh-main-accent': themeColor }">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.fresh-main {
  /* 圆角底板只铺底色，内容尺寸与分页测量保持原值 */
  border-radius: 24px;
  background: color-mix(in srgb, var(--fresh-main-accent) 6%, transparent);
}

/* 底托内容自成层叠上下文，内沿高光只画在背景里 */
.fresh-main :deep(> :first-child) {
  position: relative;
  isolation: isolate;
}

/* 底板内沿的柔和高光不参与内容测量 */
.fresh-main :deep(> :first-child)::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: 20px;
  background: color-mix(in srgb, var(--fresh-main-accent) 5%, transparent);
  pointer-events: none;
}
</style>
