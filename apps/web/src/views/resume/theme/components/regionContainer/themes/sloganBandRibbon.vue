<script>
// 标语色带自行绘制完整高度，分页只计算页面内容区内的占位。
const regionPadding = {
  top: 0, // 标语顶部额外留白
  right: 0, // 标语右侧额外留白
  bottom: 0, // 固定色带不叠加底部留白
  left: 0, // 标语左侧额外留白
};
export default { regionPadding /* 固定色带不占用额外区域留白 */ };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { defaultPaddingVertical } from "@/stores/modules/resume/config/uiConfig";
import { resolveBandStyle } from "../bandStyle";

// 顶部标语飘带自行维护固定视觉高度，页面上边距只决定它在内容区内的占位。
const bandHeight = 108;
const {
  ui,
  theme: { themeColor, themeColorContrast, themeColorLine },
} = useResumePreviewContext();

const bandStyle = computed(() => {
  const pageTop = Math.max(0, Number(ui.value?.page?.padding?.vertical ?? defaultPaddingVertical) || 0);
  return {
    ...resolveBandStyle(ui.value, "slogan", { roundTop: true }),
    height: `${Math.max(0, bandHeight - pageTop)}px`, // 内容区只占色带未被页面上边距覆盖的高度
    marginTop: "0px", // 色带背景单独贴纸张顶边，内容区域保持正常位置
    paddingTop: "0px", // 文字位置由色带自身指定
    paddingBottom: "0px", // 固定高度已包含底部空间
    "--slogan-band-height": `${bandHeight}px`, // 供背景和标语占位共用的色带高度
    "--slogan-band-page-top": `${pageTop}px`, // 供背景和标语换算纸张顶边
    "--slogan-band-content-top": "24px", // 标语文字距色带上沿的位置
    color: themeColorContrast.value,
  };
});

// 底部装饰细线：压在固定色带下沿，不占高度。
const ribbonStyle = computed(() => ({
  backgroundColor: themeColorLine.value, // 细线颜色
  top: "calc(var(--slogan-band-height) - var(--slogan-band-page-top) - 4px)", // 细线对齐色带底边
}));
</script>

<template>
  <!-- 背景从内容区向上延伸到纸张顶边，正文占位仍由标语节点提供。 -->
  <div class="relative flex w-full min-w-0" :style="bandStyle">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 [border-radius:inherit]"
      :style="{ top: 'calc(-1 * var(--slogan-band-page-top))', height: 'var(--slogan-band-height)', backgroundColor: themeColor }"
    />
    <slot />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 h-1"
      :style="ribbonStyle"
    />
  </div>
</template>

<style lang="scss" scoped></style>
