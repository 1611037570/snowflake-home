<template>
  <div
    class="relative h-full"
    :style="{ width: `${size}px` }"
  >
    <slot />
    <div
      class="absolute top-0 z-10 h-full w-px cursor-col-resize bg-transparent transition-colors hover:bg-sf-theme"
      :class="position === 'left' ? 'left-0' : 'right-0'"
      @pointerdown="handlePointerDown"
    />
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
