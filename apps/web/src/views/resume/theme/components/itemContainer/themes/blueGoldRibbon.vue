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
// 左侧引导线改由模块正文容器绘制，条目本身不再留线位。
const { fragmentStyle, boxStyle } = useItemBox(props, {
  radius: "0", // 条目保持直角
  paddingLeft: "0px", // 条目不再为引导线留出距离
});
</script>

<template>
  <!-- 条目只承载正文内容，装饰线不属于条目层级。 -->
  <div class="resume-item relative box-border" :class="{ 'resume-item--timeline': timeline }" :style="[boxStyle, fragmentStyle]">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";
</style>
