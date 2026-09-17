<script setup>
import { useIntersectionObserver, useResizeObserver } from "@vueuse/core";
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
});

const wrapRef = ref(null);
const scale = ref(1);

useResizeObserver(wrapRef, ([entry]) => {
  const { width, height } = entry.contentRect;
  if (width <= 0 || height <= 0) return;
  scale.value = Math.max(width / RESUME_WIDTH, height / RESUME_HEIGHT);
});

// 根节点与挂载标记：进入视口后才渲染缩略图，避免同屏多实例一次性渲染整份简历
const rootRef = ref(null);
const mounted = ref(false);
// 提前一屏高度预加载；挂载后立即停止观察，已挂载内容不再卸载
const { stop: stopVisibleObserve } = useIntersectionObserver(
  rootRef,
  ([entry]) => {
    if (!entry?.isIntersecting) return;
    mounted.value = true;
    stopVisibleObserve();
  },
  { rootMargin: "200px" },
);
</script>

<template>
  <div ref="rootRef" class="relative h-full w-full">
    <div
      ref="wrapRef"
      class="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden select-none"
    >
      <div class="origin-center" :style="{ transform: `scale(${scale})` }">
        <ResumePages v-if="mounted" :item="item" mode="thumb" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
