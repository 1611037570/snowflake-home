<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 右栏自己的边线随栏位铺满页高，内容仍按普通双栏自然排版。 -->
  <div class="teal-rail flex w-full min-w-0" :style="{ '--teal-rail-color': themeColor }">
    <slot />
  </div>
</template>

<style scoped>
.teal-rail :deep(> [data-resume-column="right"]) {
  box-sizing: border-box;
  align-self: stretch;
  position: relative;
  --teal-rail-title-offset: 48px;
}

.teal-rail :deep(> [data-resume-column="right"])::before {
  content: "";
  position: absolute;
  top: 15px;
  bottom: 0;
  left: 0;
  width: 1px;
  background-color: var(--teal-rail-color);
}

.teal-rail :deep(> [data-resume-column="left"]) {
  --resume-title-decoration-display: none; /* 标题组件消费栏装饰开关。 */
}
</style>
