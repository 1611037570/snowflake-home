<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolveCurrentMainRegionPadding } from "@/views/resume/theme/regionPadding";

// 白色底板正文外观（红框主题）：白色底 + 圆角 + 深色文字。
// 留白与默认正文外观同源，引擎扣除值与这里渲染的值必然一致。
const { ui } = useResumePreviewContext();

const containerStyle = computed(() => {
  const padding = resolveCurrentMainRegionPadding(ui.value);
  return {
    backgroundColor: "#ffffff", // 白色底板
    borderRadius: "18px", // 底板圆角
    color: "#222222", // 底板上的文字颜色
    paddingTop: `${padding.top}px`,
    paddingRight: `${padding.right}px`,
    paddingBottom: `${padding.bottom}px`,
    paddingLeft: `${padding.left}px`,
  };
});
</script>

<template>
  <div class="resume-view-container relative box-border flex min-w-0" :style="containerStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
