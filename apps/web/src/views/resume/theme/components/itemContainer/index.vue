<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolveItemAppearance } from "./registry";

const props = defineProps({
  // 分片覆盖的块区间：续段不画上圆角、不补上内边距
  blockRange: {
    type: Object,
    default: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }),
  },
  // 分片覆盖的正文区间
  contentRange: {
    type: Object,
    default: undefined,
  },
  // 分片装饰类型
  decoration: {
    type: String,
    default: "full",
  },
  // 时间轴条目预留固定日期栏
  timeline: {
    type: Boolean,
    default: false,
  },
});

const {
  theme: { itemTemplate },
} = useResumePreviewContext();
// 条目外观按主题编号解析，未登记的主题走 default 组件
const appearance = computed(() => resolveItemAppearance(itemTemplate.value));
</script>

<template>
  <!-- 分发器只解析外观组件：分片信息原样下传，圆角与留白由外观自己声明 -->
  <component
    :is="appearance"
    :block-range="blockRange"
    :content-range="contentRange"
    :decoration="decoration"
    :timeline="timeline"
  >
    <slot />
  </component>
</template>

<style lang="scss" scoped></style>
