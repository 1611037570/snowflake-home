<script>
import { defaultPaddingVertical } from "@/stores/modules/resume/config/uiConfig";

// 页面上边距由分页引擎统一注入，组件只负责让底色盖住这段空间。
const regionPadding = {
  top: 0, // 顶部留白由引擎按页面上边距注入
  right: 0, // 右侧不增加区域留白
  bottom: 0, // 页尾留白由栏内单独处理
  left: 0, // 左侧不增加区域留白
};
export default {
  regionPadding, // 双栏正文内容留白
};
</script>

<script setup>
import { computed } from "vue";
import { defaultPaddingHorizontal, defaultPaddingVertical } from "@/stores/modules/resume/config/uiConfig";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColorSoft },
} = useResumePreviewContext();
// 正文容器统一应用留白，侧栏背景向外延伸覆盖这段空间。
const sidebarStyle = computed(() => ({
  "--sidebar-content-top": `${Math.max(0, Number(ui.value?.page?.padding?.vertical ?? defaultPaddingVertical) || 0)}px`, // 引擎注入的页面上边距，底色向上盖住它
  "--sidebar-bleed": `${Math.max(0, Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0)}px`, // 底色向左延伸到纸张边缘
  "--sidebar-surface": themeColorSoft.value, // 左栏浅色底纹
}));
</script>

<template>
  <!-- 模块仍按栏原宽度排版，底色绝对定位在左栏内容后面。 -->
  <div class="burgundy-sidebar relative box-border flex w-full min-w-0" :style="sidebarStyle">
    <slot />
  </div>
</template>

<style scoped>
.burgundy-sidebar :deep(> *) {
  position: relative;
  align-self: stretch;
  box-sizing: border-box;
}

.burgundy-sidebar :deep(> :first-child) {
  isolation: isolate;
}

.burgundy-sidebar :deep(> :first-child)::before {
  content: "";
  position: absolute;
  z-index: -1;
  /* 续页同时覆盖正文顶部留白与纸张上边距，避免侧栏顶端露白。 */
  top: calc(-1 * (var(--sidebar-content-top) + var(--resume-page-top-space, 0px)));
  right: 0;
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  left: calc(-1 * var(--sidebar-bleed));
  background-color: var(--sidebar-surface);
}

/* 左栏标题保持纯文字，右栏标题显示点状装饰。 */
.burgundy-sidebar :deep(> :first-child .burgundy-title__dots) {
  display: none;
}
</style>
