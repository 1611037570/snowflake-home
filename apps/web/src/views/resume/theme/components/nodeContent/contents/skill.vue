<script setup lang="ts">
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";
import SkillTemplate from "@/views/resume/theme/components/skillTemplate/index.vue";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item, nodePayload } = useNodeContent(props);
const { theme: { themeColor, fontValue } } = useResumePreviewContext();

const columns = computed(() => nodePayload.value.columns === 2 || nodePayload.value.columns === 3
  ? nodePayload.value.columns : 1);
// 固定类名供样式构建收集，列数仅使用经过校验的三个值。
const GRID_CLASSES: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" };
const gridClass = computed(() => GRID_CLASSES[columns.value]);
const items = computed(() => nodePayload.value.items?.length ? nodePayload.value.items : [item.value]);
// 节点只传模板编号与档位，具体熟练度外观由公共组件绘制。
const skillTemplate = computed(() => nodePayload.value.skillTemplate || "bar");
</script>

<template>
  <div class="grid w-full gap-6" :class="gridClass" :style="fontValue()">
    <!-- 技能名称与熟练度内容在各列中居中展示。 -->
    <div v-for="(skill, skillIndex) in items" :key="skillIndex" class="min-w-0 text-center" :class="columns === 1 ? 'flex items-center justify-center gap-3' : 'flex flex-col items-center gap-3'">
      <div class="min-w-0">
        <ResumeField :model-value="skill.name" />
      </div>
      <SkillTemplate :template-id="skillTemplate" :level="Number(skill.level)" :color="themeColor || ''" :fluid="columns !== 1" />
    </div>
  </div>
</template>
