<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 学术条目外观：不依赖左侧日期栏，正文用引用式左缩进入纸。
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
  // 时间轴条目预留固定日期栏：学术外观不使用，仅保留同签名入参
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目面板留白：四周同值，宽度由模块栏宽决定 */
const ITEM_PADDING = "12px";
/** 引用式缩进：左侧留出引线位置的距离 */
const QUOTE_INDENT = "24px";

const {
  theme: { themeColor, themeColorLine, themeColorSoft },
} = useResumePreviewContext();

// 盒模型交给共享实现：圆角、分片收边与留白口径与分页测量保持一致
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: "0",
  padding: ITEM_PADDING,
  paddingLeft: QUOTE_INDENT,
  backgroundColor: themeColorSoft.value,
  borderColor: themeColorLine.value,
});
// 装饰色走主题变量，分片重绘不会与盒模型争夺内联样式
const itemStyle = computed(() => ({
  "--academic-item-quote": themeColor.value, // 引用引线与起始标记的颜色
}));
// 首个分片才画方形起始标记：续段由分片区间判断，跨页不会重复出现节点
const isItemStart = computed(
  () => !(props.blockRange.start > 0 || (props.contentRange?.start ?? 0) > 0),
);
</script>

<template>
  <!-- 居中双线页眉下的引用式正文：浅色面板 + 左侧引线，留白全部由盒模型声明 -->
  <div
    class="resume-item academic-item relative box-border"
    :class="{ 'academic-item--start': isItemStart }"
    :style="[boxStyle, fragmentStyle, itemStyle]"
  >
    <slot />
    <!-- 分片描边跟随条目分片收边：续段不画上边框，末段不画下边框 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
  </div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";

/* 引用引线：绝对定位绘制，不参与条目测量高度 */
.academic-item::before {
  content: "";
  position: absolute;
  top: 28px;
  bottom: 12px;
  left: 7px;
  width: 2px;
  background-color: var(--academic-item-quote);
  opacity: 0.45;
  pointer-events: none;
}

/* 起始标记：方形墨点标记条目开头，跨页续段由分片区间判断是否绘制 */
.academic-item--start::after {
  content: "";
  position: absolute;
  top: 15px;
  left: 4px;
  box-sizing: border-box;
  width: 8px;
  height: 8px;
  border: 2px solid var(--academic-item-quote);
  pointer-events: none;
}
</style>
