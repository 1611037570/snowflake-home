<script setup>
import {
  TransitionPresets,
  onClickOutside,
  useDebounceFn,
  useResizeObserver,
  useTransition,
} from "@vueuse/core";
import { computed, ref } from "vue";
import { RESUME_WIDTH } from "./constants";

defineOptions({ name: "ScaleContainer" });

const containerRef = ref(null);
const scaleBoxRef = ref(null);
const manualScale = ref(1);
const maxScale = ref(1);
const scaleMode = ref("auto");
const isOpen = ref(false);

const PADDING = 40;
const MIN_SCALE = 0.5;
const SCALE_LIST = [0.5, 0.7, 0.9, 1];

const percent = (value) => `${Math.round(value * 100)}%`;
const close = () => (isOpen.value = false);
onClickOutside(scaleBoxRef, close);
const scale = computed(() => (scaleMode.value === "auto" ? maxScale.value : manualScale.value));
const transitionScale = useTransition(scale, {
  duration: 200,
  transition: TransitionPresets.easeOutCubic,
});
const scaleText = computed(() => percent(transitionScale.value));
const scaleLabel = computed(() => (scaleMode.value === "auto" ? "适合屏幕" : scaleText.value));
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
  close();
};

const setAutoScale = () => {
  scaleMode.value = "auto";
  close();
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
      <!-- 展示容器：absolute + flex 居中 -->
      <div
        class="absolute inset-x-0 top-0 flex flex-col items-center"
        :style="{
          zoom: scale,
        }"
      >
        <slot></slot>
      </div>
    </SfScrollbar>

    <div
      ref="scaleBoxRef"
      class="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-300 select-none group-hover:translate-y-0 group-hover:opacity-100"
    >
      <Transition name="scale-pop">
        <div
          v-if="isOpen"
          class="absolute right-0 bottom-full mb-2 w-40 overflow-hidden rounded-xl border border-sf-b bg-sf-primary p-1 shadow-xl"
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
            <span>适合屏幕</span>
            <SfIcon
              v-if="scaleMode === 'auto'"
              icon="lucide:check"
              size="3"
              class="text-sf-theme"
            />
          </div>
        </div>
      </Transition>

      <div
        class="flex h-9 w-[160px] items-center gap-1 rounded-full border border-sf-b bg-sf-primary py-1 pr-1 pl-1.5 shadow-lg"
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
          class="h-6 flex-1 cursor-pointer rounded-full px-3 text-xs font-medium text-sf-theme transition-colors hover:bg-sf-bg-2"
          @click="isOpen = !isOpen"
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.scale-pop-enter-active,
.scale-pop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  transform-origin: bottom right;
}
.scale-pop-enter-from,
.scale-pop-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.96);
}
</style>
