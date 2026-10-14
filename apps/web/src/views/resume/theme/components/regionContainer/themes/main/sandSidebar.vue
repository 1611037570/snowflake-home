<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
// 侧栏底色覆盖纸张边缘，内容仍使用统一正文容器的留白与分页尺寸。
const sidebarStyle = computed(() => ({
  "--sand-accent": themeColor.value, // 装饰与文字使用的主题色
  "--resume-user-avatar-width": "84px", // 头像宽度
  "--resume-user-avatar-height": "84px", // 头像高度
  "--resume-user-avatar-radius": "6px", // 头像小圆角
  "--resume-user-avatar-border": "1px solid color-mix(in srgb, var(--sand-accent) 36%, transparent)", // 头像细描边
  "--resume-user-avatar-shadow": "0 3px 9px color-mix(in srgb, var(--sand-accent) 16%, transparent)", // 头像淡投影
  "--resume-user-name-color": "var(--sand-accent)", // 姓名使用金棕色
  "--resume-user-name-weight": "500", // 姓名粗细减轻
  "--resume-user-name-spacing": "0.12em", // 姓名字距
  "--resume-user-subtitle-spacing": "0.12em", // 副标题字距与姓名一致
  "--resume-user-icon-color": "var(--sand-accent)", // 联系方式图标配色
}));
</script>

<template>
  <div class="sand-sidebar isolate" :style="sidebarStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use "../../columnBleed" as *;

/* 底色以左栏为定位基准，停在栏间中缝并延伸到纸张四周。 */
.sand-sidebar :deep(> [data-resume-column="left"]) {
  isolation: isolate;
}

.sand-sidebar :deep(> [data-resume-column="left"])::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * var(--resume-page-inset-vertical, 0px));
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  right: 0;
  left: calc(-1 * var(--resume-page-inset-horizontal, 0px));
  pointer-events: none;
  background: color-mix(in srgb, var(--sand-accent) 13%, white);
}
</style>
