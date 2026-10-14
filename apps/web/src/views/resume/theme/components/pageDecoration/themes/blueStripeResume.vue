<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { useUserFieldVisibility } from "@/views/resume/theme/components/userModule/useUserFieldVisibility";

const {
  data: previewData,
  ui,
  theme: { themeColor },
} = useResumePreviewContext();
const { isUserFieldHidden } = useUserFieldVisibility();
// 页眉右侧只展示真实且可见的求职职位，不写入示例文案。
const position = computed(() =>
  isUserFieldHidden("position") ? "" : previewData.value?.user?.data?.position || "",
);
const horizontalPadding = computed(() => `${Number(ui.value?.page?.padding?.horizontal) || 0}px`);
</script>

<template>
  <!-- 首页页眉独立占位；横线与资料使用同一主题色。 -->
  <div class="relative h-[60px] w-full min-w-0" aria-hidden="true">
    <div
      class="absolute right-0 bottom-0 left-0 flex min-w-0 items-end justify-between gap-3 border-b-[5px] pb-3"
      :style="{
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding,
        borderColor: themeColor,
        color: themeColor,
      }"
    >
      <span class="min-w-0 text-[25px] leading-none tracking-[0.1em]">SKIFF RESUME</span>
      <span v-if="position" class="max-w-[45%] truncate text-[13px] tracking-[0.12em]">{{
        position
      }}</span>
    </div>
  </div>
</template>
