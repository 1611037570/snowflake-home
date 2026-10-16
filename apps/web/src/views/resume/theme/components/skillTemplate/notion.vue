<script setup lang="ts">
import { lightThemeColors } from "@/configs/modules/theme";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";

defineProps<{
  items: {
    name?: string; // 技能名称。
    desc?: string; // 技能描述。
  }[]; // 当前显示的技能条目。
  sample?: boolean; // 是否在设置菜单中展示静态示例。
}>();
</script>

<template>
  <!-- 复用主题配置中的浅色配色，让相邻技能呈现不同颜色。 -->
  <div class="flex w-full flex-wrap gap-3" :class="sample ? 'text-xs' : ''">
    <span
      v-for="(skill, index) in items"
      :key="index"
      class="max-w-full rounded-3xl px-3 py-1 text-[#2e2e2e] break-words"
      :style="{ backgroundColor: lightThemeColors[index % lightThemeColors.length].value }"
    >
      <template v-if="sample">{{ skill.name }}{{ skill.desc ? ` ${skill.desc}` : '' }}</template>
      <template v-else>
        <ResumeField :model-value="skill.name" tag="span" />
        <template v-if="skill.desc">{{ " " }}<ResumeField :model-value="skill.desc" tag="span" /></template>
      </template>
    </span>
  </div>
</template>
