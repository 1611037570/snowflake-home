<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const { theme: { themeColor, themeColorSoft } } = useResumePreviewContext();
// 标题在卡片内读取留白变量，独立使用时不额外缩进。
const insetStyle = {
  paddingTop: "var(--mint-title-top, 0px)", // 标题顶部留白
  paddingLeft: "var(--mint-title-inset, 0px)", // 标题左侧留白
  paddingRight: "var(--mint-title-inset, 0px)", // 标题右侧留白
};
</script>

<template>
  <!-- 双层圆点和文字构成完整标题，脱离卡片时仍可独立显示。 -->
  <div
    class="flex min-w-0 items-center gap-3 pb-3"
    :style="insetStyle"
  >
    <span
      aria-hidden="true"
      class="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full"
      :style="{ backgroundColor: themeColorSoft }"
    ><span class="h-[7px] w-[7px] rounded-full" :style="{ backgroundColor: themeColor }" /></span>
    <h2 class="min-w-0 font-semibold tracking-[0.08em] break-words" :style="{ color: themeColor }"><TitleText :title="title" /></h2>
  </div>
</template>
