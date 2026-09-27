<script setup>
import { computed } from "vue";

defineOptions({ inheritAttrs: false, name: "LayoutItem" });

const props = defineProps({
  // 调用方传入的条目样式数据
  item: {
    type: Object,
    default: () => ({}),
  },
  // 条目分片样式由分页层传入
  style: {
    type: Object,
    default: undefined,
  },
});

// 配置值直接转换为条目外观样式。
const itemStyle = computed(() => {
  const padding = props.item.padding ?? 0;
  return {
    backgroundColor: props.item.background ?? "transparent",
    borderRadius: props.item.radius ?? "0",
    padding: typeof padding === "number" ? `${padding}px` : String(padding),
  };
});
// 分页片段的边框边缘跟随外壳分片规则收起。
const itemBorderStyle = computed(() => ({
  borderColor: props.item.borderColor ?? "transparent",
  borderRadius: "inherit",
  borderTopWidth: props.style?.borderTopWidth,
  borderBottomWidth: props.style?.borderBottomWidth,
}));
</script>

<template>
  <div
    v-bind="$attrs"
    class="resume-item box-border"
    :style="[itemStyle, style]"
  >
    <slot />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="itemBorderStyle"
    />
  </div>
</template>
