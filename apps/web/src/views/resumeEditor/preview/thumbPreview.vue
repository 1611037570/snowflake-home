<script setup>
import { useResizeObserver } from "@vueuse/core";
import { ref } from "vue";
import ResumePages from "./resumePages/index.vue";
import { RESUME_HEIGHT, RESUME_WIDTH } from "./constants";

defineOptions({ name: "ThumbPreview" });

// 简历缩略图：将 A4 简历页面缩放至容器尺寸并居中显示，适配任意容器大小
defineProps({
  item: {
    type: Object,
    required: true,
  },

  // 主操作按钮文案
  actionText: {
    type: String,
    default: "使用模板",
  },
});

const wrapRef = ref(null);
const scale = ref(1);

useResizeObserver(wrapRef, ([entry]) => {
  const { width, height } = entry.contentRect;
  if (width <= 0 || height <= 0) return;
  scale.value = Math.max(width / RESUME_WIDTH, height / RESUME_HEIGHT);
});
</script>

<template>
  <div class="relative h-full w-full">
    <div
      ref="wrapRef"
      class="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden select-none"
    >
      <div class="origin-center" :style="{ transform: `scale(${scale})` }">
        <ResumePages :item="item" mode="thumb" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
