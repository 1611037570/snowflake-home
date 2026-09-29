<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { viewStyle } } = useResumePreviewContext();
// 正文容器直接使用主题解析后的外观，内边距由分页层读取同一份配置。
const containerStyle = computed(() => ({
  backgroundColor: viewStyle.value.background,
  borderRadius: `${viewStyle.value.radius}px`,
  padding: `${viewStyle.value.padding}px`,
  color: viewStyle.value.color,
}));
</script>

<template>
  <!-- 正文区域始终由同一容器承载，默认样式不改变页面外观。 -->
  <div
    class="resume-view-container relative box-border flex min-w-0"
    :style="containerStyle"
  >
    <slot />
  </div>
</template>
