<script setup>
import { computed, useTemplateRef, watch } from "vue";

defineOptions({ name: "LayoutMeasureHost" });

const props = defineProps({
  // 测量容器宽度，必须与最终页面内容宽度一致
  width: {
    type: Number,
    required: true,
  },
  // 测量容器的最小高度，避免内容未挂载完成时高度为零
  minHeight: {
    type: Number,
    default: 0,
  },
  // 页面主题样式，例如字体、字号和行高
  rootStyle: {
    type: [Object, Array],
    default: undefined,
  },
  // 测量容器元素回传给上层测量逻辑
  onMeasureEl: Function,
  // 测量宿主的字体类名必须和真实页面一致。
  className: {
    type: String,
    default: "",
  },
});

const measureRef = useTemplateRef("measureRef");

// 使用与最终页面一致的宽度测量内容，避免隐藏容器和实际页面换行不一致。
const measureStyle = computed(() => ({
  position: "fixed",
  top: "-100000px",
  left: "-100000px",
  width: `${props.width}px`,
  minWidth: `${props.width}px`,
  maxWidth: `${props.width}px`,
  minHeight: `${Math.max(0, props.minHeight)}px`,
  boxSizing: "border-box",
  visibility: "hidden",
  pointerEvents: "none",
}));

// 容器就绪或销毁时同步回传真实 DOM 元素。
watch(
  measureRef,
  (el) => {
    props.onMeasureEl?.(el || null);
  },
  { immediate: true },
);
</script>

<template>
  <div ref="measureRef" :class="['flex h-auto flex-col bg-white text-black', className]" :style="[measureStyle, rootStyle]">
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
