<script setup>
import { useResizeObserver } from "@vueuse/core";
import { ref } from "vue";
import FullscreenPreview from "./fullscreenPreview.vue";
import ResumePages from "./resumePages.vue";
import { RESUME_HEIGHT, RESUME_WIDTH } from "./constants";

defineOptions({ name: "ThumbPreview" });

// 简历缩略图：将 A4 简历页面缩放至容器尺寸并居中显示，适配任意容器大小
defineProps({
  item: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["select"]);

const wrapRef = ref(null);
const fullscreenPreviewRef = ref(null);
// 缩放比例：按容器宽高动态计算，取宽高缩放较大值，保证页面完全覆盖容器无露底（外部容器用 A4 比例时裁切最小）
const scale = ref(1);

useResizeObserver(wrapRef, ([entry]) => {
  const { width, height } = entry.contentRect;
  if (width <= 0 || height <= 0) return;
  scale.value = Math.max(width / RESUME_WIDTH, height / RESUME_HEIGHT);
});

// 放大查看简历：打开全屏预览
const openFullscreen = () => fullscreenPreviewRef.value?.open();
</script>

<template>
  <div class="relative h-full w-full">
    <div
      ref="wrapRef"
      class="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden select-none"
    >
      <div class="origin-center" :style="{ transform: `scale(${scale})` }">
        <ResumePages :item="item" />
      </div>
    </div>
    <!-- 底部操作按钮：使用模板 + 全屏，随外层 group 悬停渐显 -->
    <div class="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 pb-6">
      <button
        type="button"
        class="cursor-pointer! rounded-xl bg-sf-theme px-4 py-2 text-sm font-bold text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:-translate-y-1"
        @click="emit('select')"
      >
        使用模板
      </button>
      <button
        type="button"
        class="flex h-8 w-8 cursor-pointer! items-center justify-center rounded-full bg-sf-theme text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:-translate-y-1"
        @click="openFullscreen"
      >
        <SfIcon icon="lucide:maximize" size="4" />
      </button>
    </div>
    <FullscreenPreview ref="fullscreenPreviewRef" :item="item" />
  </div>
</template>

<style lang="scss" scoped></style>
