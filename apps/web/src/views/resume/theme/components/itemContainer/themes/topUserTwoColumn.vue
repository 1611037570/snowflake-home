<script setup>
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 通栏双栏条目外观：直角浅底托 + 主题色细描边，留白与分片收边全部交给共享盒模型。
const props = defineProps({
  // 分片覆盖的块区间：续段不画上圆角、不补上内边距
  blockRange: {
    type: Object,
    default: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }),
  },
  // 分片覆盖的正文区间
  contentRange: { type: Object, default: undefined },
  // 分片装饰类型
  decoration: { type: String, default: "full" },
  // 时间轴条目预留固定日期栏：本主题不使用日期栏，保留入参以统一外观签名
  timeline: { type: Boolean, default: false },
});

/** 条目圆角：直角与页眉细分隔线、双栏栏间线保持同一套线语言 */
const ITEM_RADIUS = "0";
/** 条目四周留白：条目之间只靠内边距留白，不用外边距，避免改变测量高度 */
const ITEM_PADDING = "12px";
/** 非时间轴时的左内边距：与其余三边同值，双栏内文字起始线一致 */
const ITEM_PADDING_LEFT = "12px";

const {
  theme: { themeColor, themeColorSoft, themeColorLine },
} = useResumePreviewContext();

const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: ITEM_PADDING,
  paddingLeft: ITEM_PADDING_LEFT,
  backgroundColor: themeColorSoft.value, // 条目底托：主题色 10%
  borderColor: themeColorLine.value, // 条目描边：主题色 40%
});

// 条目起点的主题色短划与模块标题的短划同宽，强调条目在栏内的起始位置。
const itemStyle = {
  "--top-user-item-accent": themeColor.value, // 条目左缘短划使用的主题色
};
</script>

<template>
  <div
    class="resume-item top-user-item box-border"
    :style="[boxStyle, fragmentStyle, itemStyle]"
    :class="{ 'top-user-item--open': decoration === 'full' || decoration === 'bottom' }"
  >
    <slot />
    <!-- 描边独立成层：分片上下边缘与圆角跟随共享盒模型收起，不影响条目测量高度 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
  </div>
</template>

<style scoped>
/* 描边层与短划都以条目自身为定位基准，条目在栏内保持直角块状。 */
.top-user-item {
  position: relative;
}

/* 左缘 2px 主题色短划只画在条目的收尾段上，续段不重复起笔；绝对定位不占正文宽度。 */
.top-user-item--open::before {
  content: "";
  position: absolute;
  top: 12px;
  left: 0;
  width: 2px;
  height: 12px;
  background-color: var(--top-user-item-accent);
  pointer-events: none;
}
</style>
