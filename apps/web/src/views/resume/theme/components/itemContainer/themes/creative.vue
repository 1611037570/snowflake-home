<script setup>
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 创意条目外观：左侧强调竖线 + 极浅底色 + 细描边，留白与分片收边全部交给共享盒模型
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
  // 是否使用时间轴日期栏：创意主题不使用
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目内边距：四周与右侧为 6px 的倍数，左侧额外留出 12px 强调竖线
 *  渲染与测量共用同一份数值，避免分页高度不一致 */
const ITEM_PADDING = "6px";

const {
  theme: { themeColor, themeColorSoft, themeColorLine },
} = useResumePreviewContext();
// 底色与描边在渲染时按主题色实时取值，盒模型只负责留白与分片收边
const { fragmentStyle, boxStyle } = useItemBox(props, {
  radius: "9px",
  padding: ITEM_PADDING,
  paddingLeft: "12px",
  backgroundColor: "transparent",
  borderColor: "transparent",
});
const surfaceStyle = {
  "--creative-item-accent": themeColor.value, // 竖线与条目名称使用的主色
  "--creative-item-surface": themeColorSoft.value, // 条目浅底色
  "--creative-item-line": themeColorLine.value, // 条目描边使用的 40% 主题色
};
</script>

<template>
  <!-- 竖线用绝对定位绘制：不占条目高度，续段也不会重复出线 -->
  <div
    class="resume-item creative-item box-border relative"
    :style="[boxStyle, fragmentStyle, surfaceStyle]"
  >
    <slot />
    <span aria-hidden="true" class="creative-item__accent" />
  </div>
</template>

<style lang="scss" scoped>
.creative-item {
  /* 描边与底色改用内阴影与背景绘制：不占盒子尺寸，测量高度与渲染完全一致 */
  background-color: var(--creative-item-surface);
  box-shadow: inset 0 0 0 1px var(--creative-item-line);
}

/* 斜切顶端与竖线一起体现左侧色块的母题 */
.creative-item__accent {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 4px;
  width: 2px;
  background: var(--creative-item-accent);
  opacity: 0.7;
  clip-path: polygon(0 0, 100% 9px, 100% 100%, 0 100%);
  pointer-events: none;
}

/* 条目名称沿用主题色：与左侧竖线形成同一套强调语言 */
.creative-item :deep(> .flex:first-child > .min-w-0:first-child > .font-bold) {
  color: var(--creative-item-accent);
  font-weight: 600;
}
</style>
