<script setup>
import { TransitionPresets, useDebounceFn, useResizeObserver, useTransition } from "@vueuse/core";
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { RESUME_WIDTH } from "./constants";

defineOptions({ name: "ScaleContainer" });

defineProps({
  /** 是否显示缩放操作栏 */
  showToolbar: { type: Boolean, default: true },
});

defineEmits(["fullscreen"]);

const containerRef = ref(null);
const resumeStore = useResumeStore();
const { toolbarAlwaysVisible } = storeToRefs(resumeStore);
const contentRef = ref(null);
const contentSize = ref({ width: 0, height: 0 });
const manualScale = ref(1);
const maxScale = ref(1);
const scaleMode = ref("auto");

const PADDING = 20;
const MIN_SCALE = 0.5;
const percent = (value) => `${Math.round(value * 100)}%`;
const SCALE_LIST = computed(() => [
  ...[0.5, 0.7, 0.9, 1].map((value) => {
    const name = percent(value);
    const isSelected = scaleMode.value === "manual" && manualScaleText.value === name;
    return {
      value,
      name,
      // 超出最大缩放比例的项禁用
      disabled: value > maxScale.value,
      // 选中项高亮并显示勾选
      active: isSelected,
    };
  }),
  // 自适应选项
  {
    value: "auto",
    name: "自适应",
    active: scaleMode.value === "auto",
  },
]);

const scale = computed(() => (scaleMode.value === "auto" ? maxScale.value : manualScale.value));
const transitionScale = useTransition(scale, {
  duration: 200,
  transition: TransitionPresets.easeOutCubic,
});
const scaleLabel = computed(() =>
  scaleMode.value === "auto" ? "自适应" : percent(transitionScale.value),
);
const minScale = computed(() => Math.min(MIN_SCALE, maxScale.value));
const isMinScale = computed(() => scale.value <= minScale.value);
const isMaxScale = computed(() => scale.value >= maxScale.value);
const manualScaleText = computed(() => percent(manualScale.value));

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

const handleScaleSelect = (item) => {
  if (item.value === "auto") {
    setAutoScale();
    return;
  }
  // 禁用项不响应选择
  if (item.value > maxScale.value) return;
  setManualScale(item.value);
};

const stepScale = (value) => {
  setManualScale(Number((scale.value + value).toFixed(1)));
};

const updateScale = useDebounceFn(([entry]) => {
  const { width, height } = entry.contentRect;

  // 容器过小或尺寸无效时，退化为最小缩放
  if (width <= PADDING || height <= PADDING) {
    maxScale.value = 0.1;
    return;
  }

  // 只根据宽度计算缩放比例，让内容在垂直方向可以滚动
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
      class="absolute top-4 left-1/2 z-10 -translate-x-1/2 opacity-0 transition-all duration-200 select-none"
      :class="
        toolbarAlwaysVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-4 group-hover:translate-y-0 group-hover:opacity-100'
      "
    >
      <div class="flex items-center gap-1 rounded-full border border-sf-b bg-sf-page p-2">
        <SfTooltip content="缩小">
          <SfIcon
            @click="!isMinScale && stepScale(-0.1)"
            icon="lucide:minus"
            size="5"
            boxSize="7"
            class="rounded-full text-sf-text-2"
            :class="{
              'cursor-not-allowed text-sf-text-3': isMinScale,
              'hover:bg-sf-theme-2 hover:text-sf-theme-text': !isMinScale,
            }"
          />
        </SfTooltip>
        <div
          class="group/scale-bar flex h-6 w-18 cursor-default items-center justify-center rounded-full px-3 text-sm font-medium text-sf-theme"
        >
          {{ scaleLabel }}
          <div
            class="invisible absolute top-full right-0 mt-2 w-40 origin-top-right -translate-y-1 scale-95 opacity-0 transition-all duration-150 group-hover/scale-bar:visible group-hover/scale-bar:translate-y-0 group-hover/scale-bar:scale-100 group-hover/scale-bar:opacity-100"
          >
            <SfList :list="SCALE_LIST" :border="false" @onClick="handleScaleSelect"> </SfList>
          </div>
        </div>
        <SfTooltip content="放大">
          <SfIcon
            icon="lucide:plus"
            size="5"
            boxSize="7"
            class="rounded-full text-sf-text-2"
            :class="{
              'cursor-not-allowed text-sf-text-3': isMaxScale,
              'hover:bg-sf-theme-2 hover:text-sf-theme-text': !isMaxScale,
            }"
            @click="!isMaxScale && stepScale(0.1)"
          />
        </SfTooltip>
        <SfTooltip content="全屏">
          <SfIcon
            icon="lucide:maximize"
            size="4.5"
            boxSize="7"
            class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
            @click="$emit('fullscreen')"
          />
        </SfTooltip>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
