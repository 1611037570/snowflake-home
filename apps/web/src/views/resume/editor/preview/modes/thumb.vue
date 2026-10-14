<script setup>
import { useIntersectionObserver, useMutationObserver, useResizeObserver } from "@vueuse/core";
import { onBeforeUnmount, ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import ResumePages from "../resumePages/index.vue";
import ResumePreviewSkeleton from "@/views/resume/components/resumePreviewSkeleton.vue";
import { RESUME_HEIGHT, RESUME_WIDTH } from "../shared/constants";
import { enqueueThumbMount } from "./thumbMountQueue";

defineOptions({ name: "ThumbPreview" });

const { system } = storeToRefs(useResumeStore());

// 简历缩略图：将 A4 简历页面缩放至容器尺寸并居中显示，适配任意容器大小
defineProps({
  item: {
    type: Object,
    required: true,
  },
  showLoading: { type: Boolean, default: false }, // 样式模板缩略图渲染前显示加载状态
});

const wrapRef = ref(null);
const scale = ref(1);

useResizeObserver(wrapRef, ([entry]) => {
  const { width, height } = entry.contentRect;
  if (width <= 0 || height <= 0) return;
  // 按较短的一侧缩放，确保整页简历都落在缩略图容器内。
  scale.value = Math.min(width / RESUME_WIDTH, height / RESUME_HEIGHT);
});

// 根节点与挂载标记：进入视口后才渲染缩略图，避免同屏多实例一次性渲染整份简历
const rootRef = ref(null);
const mounted = ref(false);
const previewReady = ref(false);

// 页面实际渲染后再移除加载状态，避免正文测量期间显示空白卡片。
useMutationObserver(
  wrapRef,
  () => {
    if (wrapRef.value?.querySelector(".resume-page-item")) previewReady.value = true;
  },
  { childList: true, subtree: true },
);

// 卸载时撤销尚未执行的挂载任务，避免切换分类后继续渲染旧卡片。
let cancelMount = () => {};
onBeforeUnmount(() => cancelMount());

// 提前一屏高度预加载；挂载后立即停止观察，已挂载内容不再卸载
const { stop: stopVisibleObserve } = useIntersectionObserver(
  rootRef,
  ([entry]) => {
    if (!entry?.isIntersecting) return;
    stopVisibleObserve();
    cancelMount = enqueueThumbMount(() => {
      mounted.value = true;
    });
  },
  { rootMargin: "200px" },
);
</script>

<template>
  <div ref="rootRef" class="relative h-full w-full">
    <div
      v-if="showLoading && !previewReady"
      class="absolute inset-0 z-10 flex items-center justify-center bg-sf-primary"
      role="status"
      aria-busy="true"
      aria-label="正在加载模板预览"
    >
      <ResumePreviewSkeleton />
    </div>
    <div
      ref="wrapRef"
      class="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden select-none"
    >
      <div class="origin-center" :style="{ transform: `scale(${scale})` }">
        <ResumePages
          v-if="mounted"
          :item="item"
          :show-page-number="system.showPageNumber"
          mode="thumb"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
