<script setup>
import { computed, ref } from "vue";
import { useElementSize } from "@vueuse/core";
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  /** 模块标题文字 */
  title: {
    /** 标题值类型 */
    type: String,
    /** 未传入标题时的默认文字 */
    default: "",
  },
});
const {
  theme: { themeColor, themeColorContrast, themeColorLine },
} = useResumePreviewContext();
const titleElement = ref(null);
const { width: titleWidth } = useElementSize(titleElement);
const curveStart = computed(() => Math.max(12, titleWidth.value - 96));
// 每层都用一条完整路径绘制圆角底板和弧形尾部，避免缩放时拼接边缘出现缝隙。
const getLayerPath = (offset) => {
  // 三层使用相同弧度等距错位，上下边缘保持水平相切。
  const start = curveStart.value + offset;
  const end = start + 54;
  return `M0 12Q0 0 12 0H${start}C${start + 30} 0 ${end - 27} 48 ${end} 48H0Z`;
};
</script>

<template>
  <!-- 三层完整色块覆盖标题底板，右侧预留弧形尾部的占位。 -->
  <div class="relative flex items-end">
    <h2
      ref="titleElement"
      class="relative flex max-w-full min-w-0 font-bold tracking-wide"
      :style="{ color: themeColorContrast }"
    >
      <svg
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 h-full w-full"
        :viewBox="`0 0 ${Math.max(108, titleWidth)} 48`"
        preserveAspectRatio="none"
        :style="{ fill: themeColor }"
      >
        <path :d="getLayerPath(42)" opacity="0.2" />
        <path :d="getLayerPath(21)" opacity="0.4" />
        <path :d="getLayerPath(0)" />
      </svg>
      <TitleText :title="title" class="relative px-4 py-1.5 pr-26" />
    </h2>
    <!-- 底线绘制在色块底边内侧，避免缩放时两条相邻边缘之间露出白缝。 -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 bottom-0 border-b"
      :style="{ borderColor: themeColorLine }"
    />
  </div>
</template>
