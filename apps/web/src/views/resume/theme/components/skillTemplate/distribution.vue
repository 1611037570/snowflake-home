<script setup lang="ts">
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";

const props = defineProps<{
  items: {
    name?: string; // 技能名称
    level?: number; // 该技能的一到十分评分
  }[]; // 当前显示的技能条目
  sample?: boolean; // 是否在设置菜单中展示静态示例
}>();

// 技能占比使用固定配色，并按各项评分计算相对占比。
const colors = ["#3b82f6", "#10b981", "#eab308", "#ef4444", "#ec4899", "#a855f7"];
const shares = computed(() => {
  const weights = props.items.map((item) => {
    const value = Number(item.level ?? 7);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  });
  const total = weights.reduce((sum, value) => sum + value, 0);
  return props.items.map((item, index) => ({
    name: item.name, // 图例中的技能名称
    color: colors[index % colors.length], // 比例条与图例共用固定颜色
    percent: total > 0 ? (weights[index] / total) * 100 : 0, // 归一化后的技能占比
  }));
});
const formatPercent = (value: number) => `${Number(value.toFixed(1))}%`;
</script>

<template>
  <div class="flex w-full flex-col gap-3 text-left" :class="sample ? 'text-xs' : ''">
    <div class="flex h-3 w-full overflow-hidden rounded-full bg-sf-bg" aria-hidden="true">
      <span
        v-for="(item, index) in shares"
        :key="index"
        :style="{ width: `${item.percent}%`, backgroundColor: item.color }"
      />
    </div>
    <!-- 窄卡片中的示例图例改为单列，名称预留弹性宽度。 -->
    <div class="grid gap-3" :class="sample ? 'grid-cols-1' : 'grid-cols-2'">
      <div v-for="(item, index) in shares" :key="index" class="flex min-w-0 items-center gap-3">
        <span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: item.color }" aria-hidden="true" />
        <div class="min-w-0 flex-1 truncate font-medium">
          <span v-if="sample">{{ item.name }}</span>
          <ResumeField v-else :model-value="item.name" />
        </div>
        <span class="shrink-0 text-sf-text-2">{{ formatPercent(item.percent) }}</span>
      </div>
    </div>
  </div>
</template>
