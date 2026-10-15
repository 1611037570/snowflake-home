<script setup lang="ts">
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";
import type { ContentItem } from "@/views/resume/editor/preview/resumePages/render/contentPayload";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item, nodePayload } = useNodeContent(props);
const { theme: { themeColor, themeColorSoft, fontValue } } = useResumePreviewContext();

// 熟练度总分五档，条目 level 取 1-5，越界值按边界处理
const PROFICIENCY_MAX = 5;
const columns = computed(() => nodePayload.value.columns === 2 || nodePayload.value.columns === 3
  ? nodePayload.value.columns : 1);
// 固定类名供样式构建收集，列数仅使用经过校验的三个值。
const GRID_CLASSES: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" };
const gridClass = computed(() => GRID_CLASSES[columns.value]);
const items = computed(() => nodePayload.value.items?.length ? nodePayload.value.items : [item.value]);
const level = (skill: ContentItem) => {
  const value = Number(skill.level);
  if (!Number.isFinite(value)) return 3; // 未填档位时按「熟练」展示
  return Math.min(PROFICIENCY_MAX, Math.max(1, Math.round(value)));
};
// 分段条按档位点亮，档位名展示在条尾
const segments = (skill: ContentItem) =>
  Array.from({ length: PROFICIENCY_MAX }, (_, index) => index + 1 <= level(skill));
</script>

<template>
  <div class="grid w-full gap-3" :class="gridClass" :style="fontValue()">
    <!-- 多栏时名称与熟练度条上下排列，避免窄列挤压内容。 -->
    <div v-for="(skill, skillIndex) in items" :key="skillIndex" class="min-w-0" :class="columns === 1 ? 'flex items-center justify-between gap-3' : 'flex flex-col gap-3'">
      <div class="min-w-0" :class="columns === 1 ? 'flex-1' : ''">
        <ResumeField :model-value="skill.name" />
      </div>
      <!-- 分段熟练度条：亮段取主题色，暗段取主题浅色。 -->
      <div class="flex items-center gap-1" :class="columns === 1 ? 'shrink-0' : 'w-full'" aria-hidden="true">
        <span
          v-for="(lit, index) in segments(skill)"
          :key="index"
          class="h-1.5 rounded-full transition-colors"
          :class="columns === 1 ? 'w-6' : 'min-w-0 flex-1'"
          :style="{ backgroundColor: lit ? themeColor : themeColorSoft }"
        />
      </div>
    </div>
  </div>
</template>
