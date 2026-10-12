<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 两个蓝色小块与标题块保持相同间隙。 -->
  <div class="flex items-stretch bg-[#f2f2f2]">
    <span
      aria-hidden="true"
      class="mr-[6px] w-3 shrink-0"
      :style="{ backgroundColor: themeColor }"
    />
    <span
      aria-hidden="true"
      class="mr-[6px] w-3 shrink-0"
      :style="{ backgroundColor: themeColor }"
    />
    <h2
      class="max-w-full min-w-0 px-[24px] py-[6px] font-bold tracking-wide break-words text-white"
      :style="{ backgroundColor: themeColor }"
    >
      {{ title }}
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
