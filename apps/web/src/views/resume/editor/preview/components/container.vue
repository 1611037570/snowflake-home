<script setup>
import { computed } from "vue";

defineOptions({ inheritAttrs: false, name: "Container" });

const props = defineProps({
  // 调用方传入的容器样式数据
  container: {
    type: Object,
    default: () => ({}),
  },
  // 内容容器外部间距由模块根据自身排版传入
  style: {
    type: [Object, Array, String],
    default: undefined,
  },
});

// 配置值直接转换为容器的内联样式。
const containerStyle = computed(() => {
  const padding = props.container.padding ?? 0;
  return {
    backgroundColor: props.container.background ?? "transparent",
    borderRadius: props.container.radius ?? "0",
    padding: typeof padding === "number" ? `${padding}px` : String(padding),
    "--container-border-color": props.container.borderColor ?? "transparent",
  };
});
</script>

<template>
  <div
    v-bind="$attrs"
    class="resume-container"
    :style="[containerStyle, style]"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.resume-container {
  position: relative;
  box-sizing: border-box;
}

// 使用伪元素绘制边框，避免边框参与分页测量高度。
.resume-container::after {
  content: "";
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  border: 1px solid var(--container-border-color);
  border-radius: inherit;
  pointer-events: none;
}
</style>
