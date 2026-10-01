<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolveCurrentMainRegionPadding } from "@/views/resume/theme/regionPadding";

// 默认正文外观：底板透明、无圆角，只把区域留白落在自己的盒子里。
// 引擎按同一份留白扣栏宽与可用高度，两侧读同一个解析函数。
const { ui } = useResumePreviewContext();

const containerStyle = computed(() => {
  const padding = resolveCurrentMainRegionPadding(ui.value);
  return {
    backgroundColor: "transparent",
    color: "inherit",
    paddingTop: `${padding.top}px`,
    paddingRight: `${padding.right}px`,
    paddingBottom: `${padding.bottom}px`,
    paddingLeft: `${padding.left}px`,
  };
});
</script>

<template>
  <!-- 正文区域始终由同一容器承载，默认样式不改变页面外观。 -->
  <div class="resume-view-container relative box-border flex min-w-0" :style="containerStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
