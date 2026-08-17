<script setup>
import { computed, useTemplateRef } from "vue";
import useEcharts from "./core/useEcharts";

const props = defineProps({
  options: {
    default: () => {},
  },
});
const echartsRef = useTemplateRef("echartsRef");

defineOptions({ name: "SfEcharts" });
// 度合并函数
const deepMerge = (target, source) => {
  // 目标不是对象/数组，直接返回source（source存在则用source，否则用target）
  if (typeof target !== "object" || target === null) {
    return source !== undefined ? source : target;
  }
  // 数组特殊处理：source数组直接覆盖target（ECharts series数组通常是整体替换）
  if (Array.isArray(target) || Array.isArray(source)) {
    return source !== undefined ? source : target;
  }
  // 对象：逐层合并
  const merged = { ...target };
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      merged[key] = deepMerge(target[key], source[key]);
    }
  }
  return merged;
};

const options = computed(() => {
  // 默认配置
  const defaultOptions = {
    grid: {
      left: 0, // 左偏移设为0
      right: 2, // 右偏移设为0
      top: 80, // 顶部留少量空间给标题（如果不需要标题，设为0）
      bottom: 12,
      containLabel: false, // 关键：让grid包含坐标轴标签，避免标签溢出后自动留白
    },
    legend: {
      top: 36,
    },
    title: {
      text: "ECharts 入门示例",
      top: 0,
      left: "center",
      textStyle: {
        color: "#50a2ff",
      },
    },
  };

  // 深度合并：传入的配置优先，保留默认未被覆盖的属性
  return deepMerge(defaultOptions, props.options);
});
useEcharts(echartsRef, options);
</script>

<template>
  <div ref="echartsRef" class="bg-sf-primary p-3 text-sf-base!"></div>
</template>

<style lang="scss" scoped></style>
