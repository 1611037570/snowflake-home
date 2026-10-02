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
  // 排版节点类型：供条目外观判断是否为经历分组
  nodeType: {
    type: String,
    default: "",
  },
});

const {
  theme: { themeTemplate },
} = useResumePreviewContext();
// 条目外观按主题编号解析，未登记的主题走 default 组件
const appearance = computed(() => resolveItemAppearance(themeTemplate.value));
// 时间轴外观只对分组条目启用日期栏，调用方仅提供节点类型。
// 方节点主题复用既有日期侧栏，布局与分页无需增加主题分支。
const timeline = computed(() =>
  ["timeline", "squareTimeline"].includes(themeTemplate.value) && props.nodeType === "group",
);
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
    <!-- 日期栏由条目外观决定，渲染与测量共用同一结果。 -->
    <slot :date-rail="timeline" />
  </component>
</template>

<style lang="scss" scoped></style>
