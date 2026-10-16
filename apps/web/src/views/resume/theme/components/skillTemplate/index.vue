<script setup lang="ts">
import { computed, type Component } from "vue";
import BarTemplate from "./bar.vue";
import DotTemplate from "./dot.vue";
import RingTemplate from "./ring.vue";

const props = defineProps<{
  templateId: string; // 技能模板编号
  level: number; // 所有技能样式共用的一到十分评分
  color: string; // 点亮部分的主题色
  fluid?: boolean; // 进度条是否撑满所在列
  name?: string; // 圆环中心显示的技能名称
}>();

// 技能模板按编号调用独立组件，菜单示例与简历预览使用同一入口。
const skillTemplateComponents: Record<string, Component> = {
  bar: BarTemplate, // 进度条模板组件
  dot: DotTemplate, // 圆点模板组件
};
const selectedComponent = computed(() => skillTemplateComponents[props.templateId] || BarTemplate);
const level = computed(() => Number.isFinite(props.level) ? Math.min(10, Math.max(1, props.level)) : 7);
const ringVariant = computed<"semiRing" | "donut" | "openRing">(() =>
  props.templateId === "donut" || props.templateId === "openRing" ? props.templateId : "semiRing",
);
const isRingTemplate = computed(() => ["semiRing", "donut", "openRing"].includes(props.templateId));
</script>

<template>
  <RingTemplate
    v-if="isRingTemplate"
    :variant="ringVariant"
    :level="level"
    :color="color"
    :name="name"
  />
  <component v-else :is="selectedComponent" :level="level" :color="color" :fluid="fluid" />
</template>
