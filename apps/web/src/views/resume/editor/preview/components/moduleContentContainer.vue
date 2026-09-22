<script setup>
import { useResumePreviewContext } from "../previewContext";

defineOptions({ inheritAttrs: false, name: "ModuleContentContainer" });

defineProps({
  // 内容容器外部间距由模块根据自身排版传入
  style: {
    type: [Object, Array, String],
    default: undefined,
  },
});

const {
  theme: { moduleContentStyle },
} = useResumePreviewContext();
</script>

<template>
  <div
    v-bind="$attrs"
    class="module-content-container"
    :style="[moduleContentStyle, style]"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.module-content-container {
  position: relative;
  box-sizing: border-box;
}

// 使用伪元素绘制边框，避免边框参与分页测量高度。
.module-content-container::after {
  content: "";
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  border: 1px solid var(--module-content-border-color);
  border-radius: inherit;
  pointer-events: none;
}
</style>
