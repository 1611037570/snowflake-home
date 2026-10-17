<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor, themeColorContrast } } = useResumePreviewContext();
// 页眉渐变和文字对比色都由当前主题色派生。
const headerStyle = computed(() => ({
  backgroundImage: [
    `radial-gradient(circle 100px at 83% 3%, color-mix(in srgb, ${themeColor.value} 24%, transparent) 99%, transparent 100%)`,
    `radial-gradient(circle 66px at 98% 100%, color-mix(in srgb, ${themeColor.value} 18%, transparent) 99%, transparent 100%)`,
    `linear-gradient(108deg, color-mix(in srgb, ${themeColor.value} 78%, black) 0%, ${themeColor.value} 58%, color-mix(in srgb, ${themeColor.value} 76%, white) 100%)`,
  ].join(", "),
  "--resume-user-name-color": themeColorContrast.value, // 姓名使用主题色对比文字
  "--resume-user-subtitle-color": themeColorContrast.value, // 副标题使用主题色对比文字
  "--resume-user-contact-label-color": themeColorContrast.value, // 资料标签使用主题色对比文字
}));
</script>

<template>
  <!-- 页眉背景贴到纸张顶边，正文仍由公共区域间距隔开。 -->
  <div
    class="mint-cards-user relative flex w-full min-w-0 overflow-hidden rounded-b-[36px] text-white"
    :style="headerStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
.mint-cards-user {
  --resume-user-name-size: 38px; /* 姓名字号 */
}
</style>
