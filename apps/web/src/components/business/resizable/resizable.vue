<template>
  <div class="relative h-full" :style="{ width: `${size}px` }">
    <slot />
    <!-- 线条仅在悬停拖拽块时显示 -->
    <div
      class="group absolute top-0 z-10 h-full w-3"
      :class="position === 'left' ? 'left-0' : '-right-1.5'"
    >
      <div
        class="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 rounded-xl bg-sf-theme-2 opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div
        class="absolute top-1/2 h-12 w-3 -translate-y-1/2 cursor-col-resize rounded-xl border border-sf-b bg-sf-primary transition-all hover:scale-110"
        @pointerdown="handlePointerDown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";

defineOptions({ name: "SfResizable" });

const props = withDefaults(
  defineProps<{
    max?: number;
    min?: number;
    position?: "left" | "right";
  }>(),
  {
    max: Number.POSITIVE_INFINITY,
    min: 0,
    position: "right",
  },
);

const size = defineModel<number>("size", { default: 240 });
const emit = defineEmits<{ resize: [size: number] }>();

const startX = ref(0);
const startSize = ref(0);
const isDragging = ref(false);

function getValidSize(size: number) {
  return Math.min(Math.max(size, props.min), props.max);
}

function handlePointerDown(event: PointerEvent) {
  // 记录拖拽起点，后续按拖拽方向计算容器尺寸
  startX.value = event.clientX;
  startSize.value = size.value;
  isDragging.value = true;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function handlePointerMove(event: PointerEvent) {
  if (!isDragging.value) return;

  const offset = event.clientX - startX.value;
  // 左侧拖拽线向左移动时扩大容器，右侧拖拽线向右移动时扩大容器
  const nextSize = props.position === "left" ? startSize.value - offset : startSize.value + offset;
  size.value = getValidSize(nextSize);
  emit("resize", size.value);
}

function handlePointerUp() {
  // 结束拖拽并等待下一次指针按下
  isDragging.value = false;
  startSize.value = 0;
}

useEventListener("pointermove", handlePointerMove);
useEventListener("pointerup", handlePointerUp);
</script>

<style scoped></style>
