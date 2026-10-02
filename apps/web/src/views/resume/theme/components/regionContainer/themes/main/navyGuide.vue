<script>
// 纵线与正文共用区域宽度，分页按相同的左留白测量换行。
const regionPadding = {
  top: 0, // 正文顶部不增加留白
  right: 0, // 正文右侧不增加留白
  bottom: 0, // 正文底部不增加留白
  left: 30, // 左侧为纵线和标题标记预留空间
};
export default { regionPadding };
</script>

<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 正文容器接住剩余空间，纵线在同一容器内绘制。 -->
  <div
    class="resume-view-container relative box-border flex min-w-0"
    :style="{ '--navy-guide-rail-offset': `${regionPadding.left}px` }"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0 left-0 w-px opacity-30"
      :style="{ backgroundColor: themeColor }"
    />
    <slot />
  </div>
</template>
