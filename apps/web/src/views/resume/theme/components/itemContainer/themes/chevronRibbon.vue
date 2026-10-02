<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 箭头长条条目外观：左端小箭头符号 + 右缘细飘带，延续标题的箭头语言。
// 分片圆角与续段收边由共享盒模型计算，外观只声明留白与配色。
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

/** 条目圆角：由外观自己声明，分片内外侧由共享规则裁剪 */
const ITEM_RADIUS = "12px";
/** 条目四周留白：底色与正文之间保持统一的呼吸感 */
const ITEM_PADDING = "12px";
/** 非时间轴时的左内边距：为左端箭头符号预留落位 */
const PADDING_LEFT = "18px";

const {
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();

// 盒模型统一由共享方法给出，测量与渲染读取同一份留白
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: ITEM_PADDING,
  paddingLeft: PADDING_LEFT,
  backgroundColor: "#ffffff",
  borderColor: "var(--chevron-item-line)",
});
// 装饰只在完整分片或末段出现，续段不重复画箭头和飘带
const showsMark = computed(() => props.decoration !== "middle" && props.decoration !== "bottom");
// 配色变量：描边、箭头与飘带都取自主题色派生值
const itemStyle = computed(() => ({
  "--chevron-item-accent": themeColor.value, // 左端箭头符号与右缘飘带的主题色
  "--chevron-item-line": `${themeColor.value}66`, // 条目描边使用的主题色线条
  "--chevron-item-contrast": themeColorContrast.value, // 箭头符号内部的浅色箭尖
}));
</script>

<template>
  <!-- 条目自身作为定位基准，箭头与飘带因此不会越到相邻栏位上 -->
  <div
    class="resume-item chevron-ribbon-item relative box-border"
    :style="[boxStyle, fragmentStyle, itemStyle]"
  >
    <slot />
    <!-- 描边复用共享分片规则：续段自动收起上下边 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
    <!-- 左端小箭头落在条目左内边距内，不挤压正文内容 -->
    <span v-if="showsMark" aria-hidden="true" class="chevron-ribbon-item__mark" />
    <!-- 右缘细飘带贴住正文右边界，箭头尖端朝右与标题长条同向 -->
    <span v-if="showsMark" aria-hidden="true" class="chevron-ribbon-item__ribbon" />
  </div>
</template>

<style scoped>
/* 左端小箭头：主体为主题色箭头，内部叠一层浅色箭尖呼应标题的三层箭头 */
.chevron-ribbon-item__mark {
  position: absolute;
  top: calc(50% - 8px);
  left: 3px;
  width: 12px;
  height: 16px;
  background: var(--chevron-item-accent);
  clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 50%, calc(100% - 5px) 100%, 0 100%);
  pointer-events: none;
}

.chevron-ribbon-item__mark::after {
  content: "";
  position: absolute;
  inset: 4px 0 4px 4px;
  background: var(--chevron-item-contrast);
  clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 50%, calc(100% - 4px) 100%, 0 100%);
}

/* 右缘细飘带：只占装饰宽度，条目留白仍由盒模型的内边距表达 */
.chevron-ribbon-item__ribbon {
  position: absolute;
  top: 0;
  right: -6px;
  bottom: 0;
  width: 3px;
  background: color-mix(in srgb, var(--chevron-item-accent) 42%, transparent);
  pointer-events: none;
}
</style>
