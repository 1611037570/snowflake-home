<script>
import { defaultPaddingVertical } from "@/stores/modules/resume/config/uiConfig";

// 双栏内容顶部留白跟随页面边距，分页与渲染读取同一份解析结果。
const regionPadding = (ui) => ({
  top: Math.max(0, Number(ui?.page?.padding?.vertical ?? defaultPaddingVertical) || 0), // 左右栏内容顶部留白
  right: 0, // 右侧不增加区域留白
  bottom: 0, // 页尾留白由栏内单独处理
  left: 0, // 左侧不增加区域留白
});
export default {
  regionPadding, // 双栏正文内容留白
};
</script>

<script setup>
import { computed } from "vue";
import { defaultPaddingHorizontal, defaultPageRadius } from "@/stores/modules/resume/config/uiConfig";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColorSoft },
} = useResumePreviewContext();
// 正文容器统一应用留白，侧栏背景向外延伸覆盖这部分空间。
const sidebarStyle = computed(() => ({
  "--sidebar-content-top": `${regionPadding(ui.value).top}px`, // 左右栏内容顶部留白
  "--sidebar-bleed": `${Math.max(0, Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0)}px`, // 底色向左延伸到纸张边缘
  "--sidebar-radius": `${Math.max(0, Number(ui.value?.page?.radius ?? defaultPageRadius) || 0)}px`, // 底色左下圆角
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
  top: calc(-1 * var(--sidebar-content-top));
  right: 0;
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  left: calc(-1 * var(--sidebar-bleed));
  background-color: var(--sidebar-surface);
  border-bottom-left-radius: var(--sidebar-radius);
}

/* 左栏标题保持纯文字，右栏标题显示点状装饰。 */
.burgundy-sidebar :deep(> :first-child .burgundy-title__dots) {
  display: none;
}
</style>
