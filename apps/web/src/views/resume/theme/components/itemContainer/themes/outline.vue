<script setup>
import { useItemBox } from "../useItemBox";

// 线框条目外观：外框由模块外壳绘制，条目只保留内边距。
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
const ITEM_RADIUS = "0";
/** 非时间轴时的左内边距：与其余三边一致，避免正文贴住模块左边框 */
const PADDING_LEFT = "12px";

// 卡片内部留白与续段收边由公共盒模型处理。
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS, // 条目圆角
  padding: "12px", // 四周装饰内边距
  paddingLeft: PADDING_LEFT, // 非日期栏正文左侧留白
});
</script>

<template>
  <div
    class="resume-item box-border"
    :class="{ 'resume-item--timeline': timeline }"
    :style="[boxStyle, fragmentStyle]"
  >
    <slot />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
  </div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";
</style>
