<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolveMainRegionPadding } from "@/views/resume/theme/regionPadding";

const {
  ui,
  theme: { viewStyle },
} = useResumePreviewContext();
// 正文容器直接使用主题解析后的外观；内边距与分页层读同一份区域留白声明
const containerStyle = computed(() => {
  const padding = resolveMainRegionPadding(ui.value, viewStyle.value.padding);
  return {
    backgroundColor: viewStyle.value.background,
    borderRadius: `${viewStyle.value.radius}px`,
    paddingTop: `${padding.top}px`,
    paddingRight: `${padding.right}px`,
    paddingBottom: `${padding.bottom}px`,
    paddingLeft: `${padding.left}px`,
    color: viewStyle.value.color,
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
