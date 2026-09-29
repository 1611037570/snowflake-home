<script setup>
import { computed } from "vue";

defineOptions({ inheritAttrs: false, name: "Item" });

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
  // 时间轴条目预留固定日期栏，并让竖线随正文高度延伸。
  timeline: {
    type: Boolean,
    default: false,
  },
});

// 配置值直接转换为条目外观样式。
const itemStyle = computed(() => {
  const padding = props.item.padding ?? 0;
  return {
    backgroundColor: props.item.background ?? "transparent",
    borderRadius: props.item.radius ?? "0",
    padding: typeof padding === "number" ? `${padding}px` : String(padding),
    paddingLeft: props.timeline ? "var(--timeline-rail-width)" : undefined,
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
    :class="{ 'resume-item--timeline': timeline }"
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

<style scoped>
.resume-item--timeline {
  position: relative;
  --timeline-rail-width: 144px;
}

/* 竖线属于整个条目容器，随右侧内容和分页分片自然拉伸。 */
.resume-item--timeline::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--timeline-rail-width) - 18px);
  border-left: 1px solid currentColor;
  opacity: 0.2;
  pointer-events: none;
}
</style>
