<script>
// 正文区域留白：与模板 pt-9 / pb-6 换算一致，渲染与分页读取同一份尺寸
const regionPadding = {
  top: 36, // 正文顶部留白
  right: 0, // 水平留白沿用页面设置
  bottom: 24, // 正文底部留白
  left: 0, // 水平留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
// 双栏底色与栏间斜切分栏线只在左右布局下绘制：单栏没有第二栏，画出来会落错位置
const isTwoColumn = computed(() => {
  const type = ui.value?.layout?.type;
  return type === "twoColumn" || type === "topUserTwoColumn";
});
const surfaceStyle = computed(() => ({
  "--creative-main-accent": themeColor.value || "#000000", // 柱体、斜纹与栏间线的主题色
  "--creative-main-accent-soft": themeColorLine.value || "#999999", // 栏间线使用的 40% 主题色
}));
</script>

<template>
  <!-- 创意正文区域：留白只由 pt-9 / pb-6 表达，色块、斜纹与栏间线全部走装饰层 -->
  <div
    class="creative-main isolate box-border w-full min-w-0 pt-9 pb-6"
    :class="{ 'creative-main--split': isTwoColumn }"
    :style="surfaceStyle"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.creative-main {
  position: relative;
}

/* 左缘斜切柱体：双栏下让位给栏底色，避免两套装饰叠加 */
.creative-main:not(.creative-main--split)::before {
  content: "";
  position: absolute;
  top: 0;
  left: -1px;
  width: 9px;
  height: 96px;
  background: color-mix(in srgb, var(--creative-main-accent) 40%, white);
  clip-path: polygon(0 0, 100% 18px, 100% 100%, 0 100%);
  pointer-events: none;
}

/* 标题上方的淡斜纹底托：只占左上角一小块，用来呼应斜切母题 */
.creative-main:not(.creative-main--split)::after {
  content: "";
  position: absolute;
  top: 12px;
  left: 0;
  width: 120px;
  height: 21px;
  background-image: repeating-linear-gradient(
    -45deg,
    color-mix(in srgb, var(--creative-main-accent) 6%, white) 0 6px,
    transparent 6px 12px
  );
  pointer-events: none;
}

/* 双栏下两栏都拉伸到区域底部，底色才能铺满纸张剩余高度 */
.creative-main--split :deep(> *) {
  position: relative;
  align-self: stretch;
  box-sizing: border-box;
  padding: 0;
}

/* 左栏底色不设 bottom:0，避免盖住页脚预留空间 */
.creative-main--split :deep(> :first-child)::before {
  content: "";
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--creative-main-accent) 5%, white);
  pointer-events: none;
}

/* 分栏线锚定右栏左缘，落在栏间距中间，不参与栏宽计算 */
.creative-main--split :deep(> :nth-child(2))::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -12px;
  width: 2px;
  background: var(--creative-main-accent-soft);
  transform: skewX(-10deg);
  pointer-events: none;
}
</style>
