<script setup>
import { useResumeStore } from "@/stores";
import { xiaoYangResumeItem } from "@/stores/modules/resume/xiaoYangData";
import { ref } from "vue";
import ThumbPreview from "@/views/resumeEditor/preview/thumbPreview.vue";
import FullscreenPreview from "@/views/resumeEditor/preview/fullscreenPreview.vue";

const resumeStore = useResumeStore();

const fullscreenPreviewRef = ref(null);

// 使用模板
const selectTemplate = () => {
  resumeStore.addResume(xiaoYangResumeItem);
};

// 放大查看模板简历
const openPreview = () => {
  fullscreenPreviewRef.value?.open();
};
</script>

<template>
  <div class="relative z-4 mx-auto flex w-[1120px] flex-col gap-4">
    <div class="flex h-8 items-center">
      <h2 class="text-[20px] font-black text-sf-theme">风格模板</h2>
    </div>
    <div class="group relative h-[400px] w-[282px] rounded-xl bg-sf-theme">
      <div
        class="relative h-full w-full overflow-hidden rounded-xl transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1"
      >
        <!-- 模板简历第一页缩略图：A4 页面缩放至卡片尺寸，居中覆盖卡片并裁切超出部分（transform 视觉缩放，不影响测量分页） -->
        <ThumbPreview :item="xiaoYangResumeItem" />
        <!-- 使用模板 + 放大查看按钮 -->
        <div class="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 pb-6">
          <button
            type="button"
            class="cursor-pointer! rounded-xl bg-sf-theme px-4 py-2 text-sm font-bold text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:-translate-y-1"
            @click="selectTemplate"
          >
            使用模板
          </button>
          <button
            type="button"
            class="flex h-8 w-8 cursor-pointer! items-center justify-center rounded-full bg-sf-theme text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:-translate-y-1"
            @click="openPreview"
          >
            <SfIcon icon="lucide:maximize" size="4" />
          </button>
        </div>
      </div>
    </div>
    <FullscreenPreview ref="fullscreenPreviewRef" :item="xiaoYangResumeItem" />
  </div>
</template>

<style lang="scss" scoped></style>
