<script setup>
import { useItemBox } from "../useItemBox";

const props = defineProps({
  blockRange: { // 当前分片块区间
    type: Object, // 块区间对象类型
    default: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }), // 缺省完整条目
  },
  contentRange: { // 当前分片正文区间
    type: Object, // 字符区间对象类型
    default: undefined, // 缺省完整正文
  },
  decoration: { // 当前分片装饰阶段
    type: String, // 阶段编号类型
    default: "full", // 缺省完整条目
  },
  timeline: { // 公共时间轴状态
    type: Boolean, // 时间轴开关类型
    default: false, // 缺省不使用时间轴
  },
});
const { fragmentStyle, boxStyle } = useItemBox(props, {
  radius: "0", // 条目保持直角
  padding: "6px", // 正文距边框的间距
  paddingLeft: "6px", // 左侧正文不贴边框
});
</script>

<template>
  <!-- 正文内边距继续由可测量的公共条目盒模型计算。 -->
  <div class="resume-item box-border min-w-0" :class="{ 'resume-item--timeline': timeline }" :style="[boxStyle, fragmentStyle]"><slot /></div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";
</style>
