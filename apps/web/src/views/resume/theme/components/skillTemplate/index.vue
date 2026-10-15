<script setup lang="ts">
import { computed, type Component } from "vue";
import BarTemplate from "./bar.vue";
import DotTemplate from "./dot.vue";
import ScoreTemplate from "./score.vue";

const props = defineProps<{
  templateId: string; // 技能模板编号
  level: number; // 熟练度档位
  color: string; // 点亮部分的主题色
  fluid?: boolean; // 进度条是否撑满所在列
}>();

// 技能模板按编号调用独立组件，菜单示例与简历预览使用同一入口。
const skillTemplateComponents: Record<string, Component> = {
  bar: BarTemplate, // 进度条模板组件
  dot: DotTemplate, // 圆点模板组件
  score: ScoreTemplate, // 分数模板组件
};
const selectedComponent = computed(() => skillTemplateComponents[props.templateId] || BarTemplate);
const level = computed(() => Number.isFinite(props.level) ? Math.min(5, Math.max(1, Math.round(props.level))) : 3);
</script>

<template>
  <component :is="selectedComponent" :level="level" :color="color" :fluid="fluid" />
</template>
