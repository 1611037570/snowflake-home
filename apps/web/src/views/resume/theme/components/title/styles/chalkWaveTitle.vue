<script setup>
import { computed } from "vue";
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
// 标题下的波浪线随主题颜色变化，独立标题主题也可直接使用。
const waveStyle = computed(() => ({
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="8" viewBox="0 0 16 8"><path d="M0 4Q4 0 8 4T16 4" fill="none" stroke="${themeColor.value}" stroke-width="2" stroke-linecap="round"/></svg>`)}")`,
}));
</script>

<template>
  <!-- 空心三角与标题组成一行，根节点收缩到内容宽度，波浪线沿该行宽度重复绘制。 -->
  <div class="mb-3 flex w-fit max-w-full flex-col gap-1">
    <div class="flex max-w-full min-w-0 items-center gap-3">
      <svg aria-hidden="true" class="h-6 w-6 shrink-0" viewBox="0 0 24 24">
        <path
          d="M3 12L21 2V22Z"
          fill="none"
          stroke="#E3AAB7"
          stroke-width="1.7"
          stroke-linejoin="round"
        />
      </svg>
      <h2
        class="min-w-0 font-semibold tracking-[0.12em]"
        :style="{ color: themeColor, fontFamily: 'KaiTi, STKaiti, Kaiti SC, serif' }"
      >
        <TitleText :title="title" />
      </h2>
    </div>
    <span
      aria-hidden="true"
      class="h-[8px] bg-repeat-x"
      :style="waveStyle"
    />
  </div>
</template>
