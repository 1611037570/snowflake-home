<script>
// 时间轴条目外观需要左侧日期栏：能力由外观组件自己声明，分发器不再维护主题名单。
const usesDateRail = true;
export default { usesDateRail };
</script>

<script setup>
import { useItemBox } from "../useItemBox";

// 时间轴条目外观：与默认条目同一份盒模型，额外固定启用日期栏，日期列宽度由 CSS 变量提供。
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
  // 时间轴条目预留固定日期栏，此处恒为真，保留入参以便与默认外观同签名
  timeline: {
    type: Boolean,
    default: true,
  },
});

const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: "0",
  timeline: true,
});
</script>

<template>
  <div class="resume-item resume-item--timeline box-border" :style="[boxStyle, fragmentStyle]">
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
