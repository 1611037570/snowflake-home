<script setup>
import { useResizeObserver } from "@vueuse/core";
import { ref } from "vue";
import ResumePages from "./resumePages.vue";
import { RESUME_HEIGHT, RESUME_WIDTH } from "./constants";

defineOptions({ name: "ThumbPreview" });

// 简历缩略图：将 A4 简历页面缩放至容器尺寸并居中显示，适配任意容器大小
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const wrapRef = ref(null);
// 缩放比例：按容器宽高动态计算，取宽高缩放较小值，保证 A4 页面完整显示并居中（参考简历模板页效果）
const scale = ref(1);

useResizeObserver(wrapRef, ([entry]) => {
  const { width, height } = entry.contentRect;
  if (width <= 0 || height <= 0) return;
  scale.value = Math.min(width / RESUME_WIDTH, height / RESUME_HEIGHT);
});
</script>

<template>
  <div
    ref="wrapRef"
    class="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden select-none"
  >
    <div class="origin-center" :style="{ transform: `scale(${scale})` }">
      <ResumePages :item="item" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
