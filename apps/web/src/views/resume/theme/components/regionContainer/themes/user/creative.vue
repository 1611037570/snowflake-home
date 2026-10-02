<script>
import {
  defaultPageRadius,
  defaultPaddingHorizontal,
} from "@/stores/modules/resume/config/uiConfig";

// 个人信息区域留白：与模板 pt-6 / pb-3 换算一致，渲染与分页读取同一份尺寸
const regionPadding = {
  top: 24, // 纸张顶部与个人信息之间的留白
  right: 0, // 水平留白沿用页面设置
  bottom: 12, // 个人信息与正文之间的留白
  left: 0, // 水平留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColor },
} = useResumePreviewContext();
// 左侧斜切色块向外延伸到纸张边缘：铺满自带圆角，斜边只切右端
const bandStyle = computed(() => ({
  "--creative-user-accent": themeColor.value || "#000000", // 斜切色块使用的主题色
  "--creative-user-bleed": `${Math.max(0, Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0)}px`, // 色块延伸到纸张左边缘的距离
  "--creative-user-radius": `${Math.max(0, Number(ui.value?.page?.radius ?? defaultPageRadius) || 0)}px`, // 色块沿用纸张圆角
}));
</script>

<template>
  <!-- 创意个人信息区域：左侧斜切色块作为底纹，个人信息内容保持正常排版 -->
  <div class="creative-user band box-border w-full min-w-0 pt-6 pb-3" :style="bandStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.creative-user {
  position: relative;
  isolation: isolate;
}

/* 装饰只占用绝对定位层，不参与排版，因此不改变区域高度与分页结果 */
.creative-user::before,
.creative-user::after {
  content: "";
  position: absolute;
  z-index: -1;
  pointer-events: none;
}

/* 斜切色块：右端斜边落在个人信息左缘之外，左侧与顶部延伸到纸张边缘 */
.creative-user::before {
  top: calc(-1 * var(--creative-user-bleed));
  bottom: 0;
  left: calc(-1 * var(--creative-user-bleed));
  width: calc(60px + var(--creative-user-bleed));
  background: color-mix(in srgb, var(--creative-user-accent) 10%, white);
  border-top-left-radius: var(--creative-user-radius);
  clip-path: polygon(0 0, 100% 0, 45% 100%, 0 100%);
}

/* 斜边沿用主题色描边，让色块边界与条目标题语言一致 */
.creative-user::after {
  top: calc(-1 * var(--creative-user-bleed));
  bottom: 0;
  left: 48px;
  width: 2px;
  background: color-mix(in srgb, var(--creative-user-accent) 40%, white);
  transform: skewX(-16deg);
  transform-origin: bottom;
}
</style>
