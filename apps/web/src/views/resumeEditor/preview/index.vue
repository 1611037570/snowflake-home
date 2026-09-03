<script setup>
// 简历页面渲染组件
import ResumePage from "./page.vue";
// 缩放容器组件
import ScaleContainer from "./ScaleContainer.vue";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
// 全屏预览组件
const FullscreenPreview = markRaw(defineAsyncComponent(() => import("./fullscreenPreview.vue")));
const resumeStore = useResumeStore();
const { currentData, currentConfig, currentUI, currentFixedConfig } = storeToRefs(resumeStore);

// 组装全屏预览所需的简历项
const resumeItem = computed(() => ({
  data: currentData.value,
  config: currentConfig.value,
  fixedConfig: currentFixedConfig.value,
  ui: currentUI.value,
}));

const isFullscreen = ref(false);
const fullscreenPreviewRef = ref(null);

// 异步组件加载完成后 ref 才有值，此时再打开全屏
watch(fullscreenPreviewRef, (instance) => {
  if (instance) instance.open();
});

const openFullscreen = () => {
  isFullscreen.value = true;
};
</script>

<template>
  <div
    class="scrollbar-hide relative flex h-full flex-1 flex-col items-center overflow-y-auto pt-3"
  >
    <ScaleContainer @fullscreen="openFullscreen">
      <ResumePage />
    </ScaleContainer>
    <FullscreenPreview v-if="isFullscreen" ref="fullscreenPreviewRef" :item="resumeItem" @close="isFullscreen = false" />
  </div>
</template>

<style scoped></style>
