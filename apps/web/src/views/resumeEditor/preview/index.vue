<script setup>
// 简历页面渲染组件
import ResumePage from "./page.vue";
// 缩放容器组件
import ScaleContainer from "./ScaleContainer.vue";
// 全屏预览组件
import ZoomPreview from "./zoomPreview.vue";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

const resumeStore = useResumeStore();
const { currentData, currentConfig, currentUI, currentFixedConfig } = storeToRefs(resumeStore);

// 组装全屏预览所需的简历项
const resumeItem = computed(() => ({
  data: currentData.value,
  config: currentConfig.value,
  fixedConfig: currentFixedConfig.value,
  ui: currentUI.value,
}));

const zoomPreviewRef = ref(null);
// 打开全屏预览
const openFullscreen = () => zoomPreviewRef.value?.open();
</script>

<template>
  <div
    class="scrollbar-hide relative flex h-full flex-1 flex-col items-center overflow-y-auto pt-3"
  >
    <ScaleContainer @fullscreen="openFullscreen">
      <ResumePage />
    </ScaleContainer>
    <ZoomPreview ref="zoomPreviewRef" :item="resumeItem" />
  </div>
</template>

<style scoped></style>
