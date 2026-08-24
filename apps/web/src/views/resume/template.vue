<script setup>
import { useResumeStore } from "@/stores";
import { xiaoYangResumeItem } from "@/stores/modules/resume/xiaoYangData";
import { ref } from "vue";
import ResumePages from "@/views/resumeEditor/preview/resumePages.vue";
import ZoomPreview from "@/views/resumeEditor/preview/zoomPreview.vue";

const resumeStore = useResumeStore();

const zoomPreviewRef = ref(null);

// 使用模板
const selectTemplate = () => {
  resumeStore.addResume(xiaoYangResumeItem);
};

// 放大查看模板简历
const openPreview = () => {
  zoomPreviewRef.value?.open();
};
</script>

<template>
  <div class="relative z-4 mx-auto flex w-[1120px] flex-col gap-4">
    <div class="flex h-8 items-center">
      <h2 class="text-[20px] font-black text-sf-theme">风格模板</h2>
    </div>
    <div class="group relative h-[400px] w-[282px] rounded-xl bg-sf-theme">
      <div
        class="absolute top-0 left-0 h-full w-full overflow-hidden rounded-xl bg-sf-primary transition-all duration-300 group-hover:top-[-6px] group-hover:left-[-6px]"
      >
        <!-- 模板简历第一页缩略图：A4 页面缩放至卡片尺寸，超出部分裁切（transform 视觉缩放，不影响测量分页） -->
        <div class="pointer-events-none h-full w-full overflow-hidden select-none">
          <div class="origin-top-left" style="transform: scale(0.34)">
            <ResumePages :item="xiaoYangResumeItem" />
          </div>
        </div>
        <!-- 放大查看按钮 -->
        <button
          type="button"
          class="absolute top-2 right-2 z-10 flex h-8 w-8 cursor-pointer! items-center justify-center rounded-full bg-black/40 text-white shadow transition-colors hover:bg-black/60"
          @click="openPreview"
        >
          <SfIcon icon="lucide:maximize" size="4" />
        </button>
      </div>
      <div class="absolute inset-x-0 bottom-0 z-10 flex justify-center pb-6">
        <button
          type="button"
          class="cursor-pointer! rounded-xl bg-sf-theme px-4 py-2 text-sm font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          @click="selectTemplate"
        >
          使用模板
        </button>
      </div>
    </div>
    <ZoomPreview ref="zoomPreviewRef" :item="xiaoYangResumeItem" />
  </div>
</template>

<style lang="scss" scoped></style>
