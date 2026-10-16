<script setup lang="ts">
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import ItemTags from "@/views/resume/editor/preview/components/itemTags.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";
import SkillTemplate from "@/views/resume/theme/components/skillTemplate/index.vue";
import DistributionTemplate from "@/views/resume/theme/components/skillTemplate/distribution.vue";
import ColorTags from "@/views/resume/theme/components/tagTemplate/colorTags.vue";

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
// 标签模板只取技能名称，描述与评分不进入预览。
const tagNames = computed(() => items.value.map((skill) => skill.name).filter((name) => Boolean(name)));
// 节点只传模板编号与档位，具体熟练度外观由公共组件绘制。
const skillTemplate = computed(() => nodePayload.value.skillTemplate || "none");
</script>

<template>
  <div v-if="skillTemplate === 'tag'" class="flex w-full flex-wrap gap-3 font-bold" :style="fontValue()">
    <ItemTags :tags="tagNames" />
  </div>
  <ColorTags v-else-if="skillTemplate === 'notion'" :items="items" variant="notion" :style="fontValue(-2)" />
  <ColorTags v-else-if="skillTemplate === 'rainbowTag'" :items="items" variant="rainbowTag" :style="fontValue(-2)" />
  <DistributionTemplate v-else-if="skillTemplate === 'distribution'" :items="items" :style="fontValue()" />
  <div v-else class="grid w-full gap-6" :class="gridClass" :style="fontValue()">
    <!-- 有评分图形时图形在上，名称与描述依次排到图形下方；无模板时名称与描述按文字流排列。 -->
    <div v-for="(skill, skillIndex) in items" :key="skillIndex" class="min-w-0" :class="skillTemplate === 'none' ? 'text-left' : 'text-center'">
      <div :class="skillTemplate === 'none' ? '' : 'flex flex-col items-center'">
        <!-- 技能名称统一加粗，描述保持常规字重。 -->
        <span v-if="skillTemplate === 'none'" class="min-w-0 break-words">
          <ResumeField :model-value="skill.name" tag="span" boxClass="font-bold" />
          <template v-if="skill.desc">{{ " " }}<ResumeField :model-value="skill.desc" tag="span" /></template>
        </span>
        <SkillTemplate v-else :template-id="skillTemplate" :level="Number(skill.level ?? 7)" :name="skill.name" :color="themeColor || '#50A2FF'" :fluid="columns !== 1" />
        <!-- 圆环类模板把名称画在图形内部，正文不再重复渲染名称。 -->
        <ResumeField v-if="skillTemplate !== 'none' && !['semiRing', 'donut', 'openRing'].includes(skillTemplate)" :model-value="skill.name" tag="span" boxClass="font-bold" />
        <ResumeField v-if="skill.desc && skillTemplate !== 'none'" :model-value="skill.desc" tag="span" />
      </div>
    </div>
  </div>
</template>
