<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 色条个人信息外观：首屏整块色块页眉，色块左缘与正文贯穿色条同列。
defineProps({
  // 解析后的主题编号：写入 data-theme，便于在 DOM 上识别当前主题
  themeId: {
    type: String,
    default: "colorBar",
  },
  // 模块 key：写入 data-module，供编辑器点击定位
  moduleKey: {
    type: String,
    default: "user",
  },
  // 模块附加类名，由编辑器按模块状态下发
  moduleClass: {
    type: String,
    default: "",
  },
});

/** 正文区域左留白：色块向左铺回色条所在列，正文与页眉共用同一左基准 */
const RAIL_INDENT = 24;
/** 顶部通栏版式：个人信息独占页眉区域，色块左缘已与色条同列 */
const TOP_USER_LAYOUTS = ["topUserSingleColumn", "topUserTwoColumn"];

const {
  ui,
  theme: { fontValue, lineHeightValue, themeColor, themeColorContrast },
} = useResumePreviewContext();

// 顶部通栏版式的色块由页眉区域铺满整宽，其余版式在正文栏内向左侧铺回色条列。
const insideUserRegion = computed(() => TOP_USER_LAYOUTS.includes(ui.value?.layout?.type));
const bandStyle = computed(() => ({
  marginLeft: insideUserRegion.value ? "0px" : `-${RAIL_INDENT}px`, // 色块左缘对齐色条所在列
  paddingLeft: `${RAIL_INDENT}px`, // 内容回到正文左基准
  backgroundColor: themeColor.value, // 首屏色块底色
  color: themeColorContrast.value, // 色块上的文字与图标颜色
  "--color-bar-user-contrast": themeColorContrast.value, // 头像描边使用的对比色
}));
</script>

<template>
  <!-- 个人信息色块：留白与分页测量共用同一外观，色块高度只由内容与留白决定。 -->
  <div
    class="color-bar-user resume-module-wrapper resume-user group group/module relative box-border min-w-0 pt-6 pb-6"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[lineHeightValue(), fontValue(), bandStyle]"
  >
    <slot name="actions" />
    <slot />
  </div>
</template>

<style lang="scss" scoped>
/* 头像收敛为小方图，与色块的直角语言一致。 */
.color-bar-user :deep(img) {
  width: 84px;
  height: 84px;
  object-fit: cover;
  border: 2px solid color-mix(in srgb, var(--color-bar-user-contrast) 45%, transparent);
  border-radius: 6px;
}
</style>
