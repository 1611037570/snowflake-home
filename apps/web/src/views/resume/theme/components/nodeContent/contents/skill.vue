<script setup lang="ts">
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item } = useNodeContent(props);
const { theme: { themeColor, themeColorSoft, fontValue } } = useResumePreviewContext();

// 熟练度总分五档，条目 level 取 1-5，越界值按边界处理
const PROFICIENCY_MAX = 5;
const level = computed(() => {
  const value = Number(item.value.level);
  if (!Number.isFinite(value)) return 3; // 未填档位时按「熟练」展示
  return Math.min(PROFICIENCY_MAX, Math.max(1, Math.round(value)));
});
// 分段条按档位点亮，档位名展示在条尾
const segments = computed(() =>
  Array.from({ length: PROFICIENCY_MAX }, (_, index) => index + 1 <= level.value),
);
</script>

<template>
  <div class="flex w-full items-center justify-between gap-3" :style="fontValue()">
    <div class="min-w-0 flex-1">
      <ResumeField :model-value="item.name" />
    </div>
    <!-- 分段熟练度条：亮段取主题色，暗段取主题浅色，本身不占用额外排版空间 -->
    <div class="flex shrink-0 items-center gap-1" aria-hidden="true">
      <span
        v-for="(lit, index) in segments"
        :key="index"
        class="h-1.5 w-6 rounded-full transition-colors"
        :style="{ backgroundColor: lit ? themeColor : themeColorSoft }"
      />
    </div>
  </div>
</template>
