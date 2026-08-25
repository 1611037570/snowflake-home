<script setup>
import { useResumeStore } from "@/stores";
import { xiaoYangResumeItem } from "@/stores/modules/resume/xiaoYangData";
import ThumbPreview from "@/views/resumeEditor/preview/thumbPreview.vue";

const resumeStore = useResumeStore();

// 使用模板
const selectTemplate = () => {
  resumeStore.addResume(xiaoYangResumeItem);
};
</script>

<template>
  <div class="relative z-4 mx-auto flex w-[1120px] flex-col gap-4">
    <div class="flex h-8 items-center">
      <h2 class="text-[20px] font-black text-sf-theme">风格模板</h2>
    </div>
    <div class="group relative h-[394px] w-[282px] rounded-xl bg-sf-theme">
      <div
        class="relative h-full w-full overflow-hidden rounded-xl transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1"
      >
        <!-- 模板简历缩略图：内含使用模板/全屏按钮与全屏预览，悬停渐显 -->
        <ThumbPreview :item="xiaoYangResumeItem" @select="selectTemplate" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
