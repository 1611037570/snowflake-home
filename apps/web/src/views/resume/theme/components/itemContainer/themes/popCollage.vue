<script setup>
import { computed, inject } from "vue";
import { useItemBox } from "../useItemBox";
import { resumeModuleKey } from "@/views/resume/editor/preview/shared/moduleContext";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  blockRange: {
    type: Object, // 分片块区间类型
    default: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }), // 默认完整区间
  },
  contentRange: { type: Object, default: undefined }, // 分片正文区间
  decoration: { type: String, default: "full" }, // 分片装饰阶段
  timeline: { type: Boolean, default: false }, // 公共日期栏状态
  itemIndex: { type: Number, default: 0 }, // 条目原始序号
});
const moduleKey = inject(resumeModuleKey, computed(() => ""));
const { bodyModuleKeys, theme: { themeColor } } = useResumePreviewContext();
// 每个模块首条沿用标题配色，后续条目按黄、粉、青轮换，跨页保持稳定。
const moduleIndex = computed(() => bodyModuleKeys.value.indexOf(moduleKey.value));
const shadowColor = computed(() => {
  const colors = ["#F7D65A", themeColor.value, "#59BCB4"];
  const baseIndex = moduleIndex.value === 0 ? 0 : moduleIndex.value % 2 === 1 ? 1 : 2;
  return colors[(baseIndex + props.itemIndex) % colors.length];
});
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: "15px", // 卡片圆角
  padding: "24px", // 卡片四周内边距
  paddingLeft: "24px", // 非时间轴正文左边距
  backgroundColor: "#FFFFFF", // 卡片底色
  borderColor: "#242424", // 深色描边
});
</script>

<template>
  <!-- 描边与错位投影只属于当前条目，正文仍交由公共内容组件渲染。 -->
  <div
    class="resume-item relative box-border"
    :class="{ 'resume-item--timeline': timeline }"
    :style="[boxStyle, fragmentStyle, { boxShadow: `8px 8px 0 ${shadowColor}` }]"
  >
    <slot />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border-2"
      :style="borderStyle"
    />
  </div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";
</style>
