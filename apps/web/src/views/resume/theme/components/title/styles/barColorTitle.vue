<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 双栏模块标题：短竖条 + 标题 + 通栏细线，窄栏里用横向元素替代下划线更省纵向空间。
defineProps({
  title: { type: String, default: "" }, // 当前模块的显示标题
});
const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 装饰元素不参与留白计算，标题高度仍由文字与 pb-3 决定。 -->
  <div class="two-column-title relative flex min-w-0 items-center gap-3 pb-3">
    <span
      aria-hidden="true"
      class="pointer-events-none h-[12px] w-[3px] shrink-0 rounded-full"
      :style="{ backgroundColor: themeColor }"
    />
    <h2 class="min-w-0 shrink-0 font-bold tracking-[0.04em] break-words" :style="{ color: themeColor }">
      <TitleText :title="title" />
    </h2>
    <span
      aria-hidden="true"
      class="h-px min-w-0 flex-1"
      :style="{ backgroundColor: themeColorLine }"
    />
  </div>
</template>
