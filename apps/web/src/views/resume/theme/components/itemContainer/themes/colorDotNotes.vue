<script setup>
import { useItemBox } from "../useItemBox";

const props = defineProps({
  blockRange: { type: Object, default: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }) }, // 分片块区间
  contentRange: { type: Object, default: undefined }, // 分片正文区间
  decoration: { type: String, default: "full" }, // 分片装饰阶段
  timeline: { type: Boolean, default: false }, // 公共日期栏状态
});
// 浅灰便签的内边距与续段收边交由公共盒模型统一处理。
const { fragmentStyle, boxStyle } = useItemBox(props, {
  radius: "0", // 方角便签
  padding: "15px", // 四周留白
  paddingLeft: "15px", // 非日期栏左侧留白
  backgroundColor: "#F7F8FA", // 便签浅灰底色
});
</script>

<template>
  <!-- 左栏橙色引线和右栏日期胶囊只修改外观，不改变正文分片。 -->
  <div class="color-dot-notes-item resume-item relative box-border" :class="{ 'resume-item--timeline': timeline }" :style="[boxStyle, fragmentStyle]">
    <slot />
  </div>
</template>

<style lang="scss">
@use "./itemBase.scss";

/* 引线单独画一条左侧色带：内阴影要在卡片上下边缘收口，缩放与导出时会显成接缝线。 */
[data-resume-column="left"] .color-dot-notes-item::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  background-color: #f7ab65;
  pointer-events: none;
}
/* 经历标题与日期纵向排列，适配双栏便签的窄卡片。 */
.color-dot-notes-item > .flex.flex-wrap.items-center.justify-between.gap-3:first-child {
  align-items: flex-start;
  flex-direction: column;
  gap: 3px;
}
[data-resume-column="right"] .color-dot-notes-item > .flex.flex-wrap.items-center.justify-between.gap-3:first-child > div:last-child > span {
  border-radius: 9999px;
  background: #e9ecef;
  padding: 2px 12px;
  color: #8b98a8;
  font-size: 13px;
}
</style>
