<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 经典条目外观：不加底色与圆角，条目内留出上下呼吸，只用细化线分隔相邻条目。
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
  // 时间轴日期栏：经典主题为单栏左置日期，不启用固定日期栏
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目圆角：经典风格保持直角，分片内外侧由共享规则裁剪 */
const ITEM_RADIUS = "0";
/** 条目内边距：与正文段落间距叠加后形成条目之间的呼吸 */
const ITEM_PADDING = "6px";

const {
  theme: { fontValue, themeColorLine },
} = useResumePreviewContext();
// 盒模型、分片收边与日期栏判断统一由共享逻辑给出，外观只声明自己的留白。
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS, // 直角条目
  padding: ITEM_PADDING, // 条目四边一致的内部呼吸
  paddingLeft: ITEM_PADDING, // 非时间轴时的左内边距
  backgroundColor: "transparent", // 经典风格不铺底色
  borderColor: "transparent", // 条目不描边，分隔线另用伪元素绘制
});
// 日期字号由 fontValue 派生，随主题字号配置缩放。
const dateFontSize = computed(() => fontValue.value(1).fontSize);
// 已完成条目在底部画一条细化线，跨页续段不重复绘制。
const separatorStyle = computed(() => ({
  backgroundColor: themeColorLine.value, // 分隔线颜色由主题色派生
}));
</script>

<template>
  <div
    class="resume-item classic-item box-border"
    :class="{ 'resume-item--timeline': timeline }"
    :style="[boxStyle, fragmentStyle, { '--classic-date-size': dateFontSize }]"
  >
    <slot />
    <span
      v-if="decoration === 'full' || decoration === 'bottom'"
      aria-hidden="true"
      class="classic-item__separator pointer-events-none absolute inset-x-0 bottom-0 h-px"
      :style="separatorStyle"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
  </div>
</template>

<style lang="scss" scoped>
/* 条目标题统一加粗，与左置日期形成经典的层级对比。 */
.classic-item :deep(> .flex:first-child > .min-w-0:first-child) {
  font-weight: 600;
}

/* 日期左置时先于标题出现，字号与颜色单独控制。 */
.classic-item :deep(> .flex:first-child > .order-first) {
  flex: 0 0 auto;
  margin-right: 12px;
  color: var(--sf-text-2);
  font-weight: 500;
}

/* 日期字号跟随主题字号配置，覆盖引擎内联的基准字号。 */
.classic-item :deep(> .flex:first-child > .order-first > span) {
  font-size: var(--classic-date-size);
  letter-spacing: 0.02em;
}

/* 日期右置时保持原位置，仅统一字重与颜色。 */
.classic-item :deep(> .flex:first-child > .flex:last-child) {
  color: var(--sf-text-2);
  font-weight: 500;
}
</style>
