<script setup>
import { TransitionPresets, useDebounceFn, useResizeObserver, useTransition } from "@vueuse/core";
import { computed, ref } from "vue";
import { RESUME_WIDTH } from "./constants";

defineOptions({ name: "ScaleContainer" });

defineProps({
  /** 是否显示缩放操作栏 */
  showToolbar: { type: Boolean, default: true },
});

defineEmits(["fullscreen"]);

const containerRef = ref(null);
const contentRef = ref(null);
const contentSize = ref({ width: 0, height: 0 });
const manualScale = ref(1);
const maxScale = ref(1);
const scaleMode = ref("auto");

const PADDING = 40;
const MIN_SCALE = 0.5;
const SCALE_LIST = [0.5, 0.7, 0.9, 1];

const percent = (value) => `${Math.round(value * 100)}%`;
const scale = computed(() => (scaleMode.value === "auto" ? maxScale.value : manualScale.value));
const transitionScale = useTransition(scale, {
  duration: 200,
  transition: TransitionPresets.easeOutCubic,
});
const scaleText = computed(() => percent(transitionScale.value));
const scaleLabel = computed(() => (scaleMode.value === "auto" ? "自适应" : scaleText.value));
const minScale = computed(() => Math.min(MIN_SCALE, maxScale.value));
const isMinScale = computed(() => scale.value <= minScale.value);
const isMaxScale = computed(() => scale.value >= maxScale.value);

const isManualScaleSelected = (value) => {
  return scaleMode.value === "manual" && percent(manualScale.value) === percent(value);
};

const clampScale = (value) => {
  return Math.min(Math.max(value, minScale.value), maxScale.value);
};

const setManualScale = (value) => {
  scaleMode.value = "manual";
  manualScale.value = clampScale(value);
};

const setAutoScale = () => {
  scaleMode.value = "auto";
};

const stepScale = (value) => {
  setManualScale(Number((scale.value + value).toFixed(1)));
};

const updateScale = useDebounceFn(([entry]) => {
  const { width, height } = entry.contentRect;

  // 确保宽度和高度有效
  if (width <= 0 || height <= 0) return;

  // 防止除以0或负数
  if (width <= PADDING || height <= PADDING) {
    maxScale.value = 0.1;
    return;
  }

  // 只根据宽度计算缩放比例，让内容在垂直方向可以滚动
  // 取缩放比例，且最大不超过 1
  maxScale.value = (width - PADDING) / RESUME_WIDTH;
  manualScale.value = clampScale(manualScale.value);
}, 100);

useResizeObserver(() => containerRef.value?.wrapRef, updateScale);

// 测量未缩放内容的实际宽高，用于补偿 transform: scale() 不改变布局尺寸的问题
useResizeObserver(contentRef, ([entry]) => {
  contentSize.value = {
    width: entry.contentRect.width,
    height: entry.contentRect.height,
  };
});
</script>

<template>
  <div class="group relative h-full w-full">
    <!-- 测量容器：relative + overflow-y-auto 允许垂直滚动 -->
    <SfScrollbar
      ref="containerRef"
      class="relative h-full w-full"
      height="100%"
      view-class="relative min-h-full w-full pt-3"
    >
      <!-- 缩放展示：外层承担缩放后的布局尺寸并水平居中，内层用 transform: scale() 缩放 -->
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2"
        :style="{
          width: `${contentSize.width * scale}px`,
          height: `${contentSize.height * scale}px`,
        }"
      >
        <div
          ref="contentRef"
          class="w-fit"
          :style="{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }"
        >
          <slot></slot>
        </div>
      </div>
    </SfScrollbar>

    <div
      v-if="showToolbar"
      class="group/scale-bar absolute bottom-4 left-1/2 z-10 -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-300 select-none group-hover:translate-y-0 group-hover:opacity-100"
    >
      <div
        class="invisible absolute right-0 bottom-full mb-2 w-40 origin-bottom-right translate-y-1 scale-95 rounded-xl border border-sf-b bg-sf-primary p-1 opacity-0 shadow-xl transition-all duration-150 group-hover/scale-bar:visible group-hover/scale-bar:translate-y-0 group-hover/scale-bar:scale-100 group-hover/scale-bar:opacity-100"
      >
        <div
          v-for="item in SCALE_LIST"
          :key="item"
          class="flex h-9 cursor-pointer items-center justify-between rounded-lg px-3 text-sm transition-colors"
          :class="{
            'font-medium text-sf-theme': isManualScaleSelected(item),
            'cursor-not-allowed text-sf-text-3': item > maxScale,
            'text-sf-text hover:bg-sf-bg-2': item <= maxScale && !isManualScaleSelected(item),
          }"
          @click="item <= maxScale && setManualScale(item)"
        >
          <span>{{ percent(item) }}</span>
          <SfIcon
            v-if="isManualScaleSelected(item)"
            icon="lucide:check"
            size="3"
            class="text-sf-theme"
          />
        </div>
        <div class="mx-2 my-1 h-px bg-sf-b"></div>
        <div
          class="flex h-9 cursor-pointer items-center justify-between rounded-lg px-3 text-sm transition-colors"
          :class="{
            'font-medium text-sf-theme': scaleMode === 'auto',
            'text-sf-text hover:bg-sf-bg-2': scaleMode !== 'auto',
          }"
          @click="setAutoScale"
        >
          <span>自适应</span>
          <SfIcon v-if="scaleMode === 'auto'" icon="lucide:check" size="3" class="text-sf-theme" />
        </div>
      </div>

      <div
        class="flex h-9 w-48 items-center gap-1 rounded-full border border-sf-b bg-sf-primary py-1 pr-1 pl-1.5 shadow-lg"
      >
        <button
          type="button"
          class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-base leading-none text-sf-text-2 transition-colors"
          :class="{
            'cursor-not-allowed text-sf-text-3': isMinScale,
            'hover:bg-sf-bg-2 hover:text-sf-text': !isMinScale,
          }"
          @click="!isMinScale && stepScale(-0.1)"
        >
          −
        </button>
        <button
          type="button"
          class="h-6 flex-1 cursor-default rounded-full px-3 text-xs font-medium text-sf-theme"
        >
          {{ scaleLabel }}
        </button>
        <button
          type="button"
          class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-base leading-none text-sf-text-2 transition-colors"
          :class="{
            'cursor-not-allowed text-sf-text-3': isMaxScale,
            'hover:bg-sf-bg-2 hover:text-sf-text': !isMaxScale,
          }"
          @click="!isMaxScale && stepScale(0.1)"
        >
          ＋
        </button>
        <button
          type="button"
          class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-sf-text-2 transition-colors hover:bg-sf-bg-2 hover:text-sf-text"
          @click="$emit('fullscreen')"
        >
          <SfIcon icon="lucide:maximize" size="3" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
