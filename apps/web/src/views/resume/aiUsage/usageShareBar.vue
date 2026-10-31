<script setup lang="ts">
import { computed } from "vue";

interface ShareItem {
  key: string; // 分段的唯一标识，用作列表 key
  label: string; // 图例显示的名称
  value: number; // 决定分段长度与百分比的用量
  detail?: string; // 百分比之后的补充说明，例如调用次数
}

const props = defineProps<{
  items: ShareItem[]; // 参与分布的分段，按传入顺序渲染
}>();

// 分段颜色按顺序轮换，集中在这里调整即可全站统一。
const PALETTE = ["bg-sf-theme", "bg-sf-success", "bg-sf-warning", "bg-sf-info", "bg-sf-error"];

// 分段宽度用精确比例，图例百分比取整，避免条长与文字对不上。
const segments = computed(() => {
  const total = props.items.reduce((sum, item) => sum + item.value, 0);
  return props.items.map((item, index) => ({
    ...item,
    color: PALETTE[index % PALETTE.length], // 按顺序取色，超出调色板长度时循环
    width: total > 0 ? (item.value / total) * 100 : 0, // 分段占整条的百分比，用于实际宽度
    percent: total > 0 ? Math.round((item.value / total) * 100) : 0, // 图例展示的整数百分比
  }));
});
</script>

<template>
  <div class="flex flex-col gap-3">
    <div v-if="segments.length" class="flex h-2 w-full overflow-hidden rounded-full bg-sf-bg">
      <span
        v-for="segment in segments"
        :key="segment.key"
        class="h-full"
        :class="segment.color"
        :style="{ width: `${segment.width}%` }"
      />
    </div>
    <ul class="flex flex-wrap gap-3">
      <li v-for="segment in segments" :key="segment.key" class="flex min-w-0 items-center gap-[6px] text-xs">
        <span class="h-[6px] w-[6px] shrink-0 rounded-full" :class="segment.color" />
        <span class="min-w-0 break-words text-sf-text">{{ segment.label }}</span>
        <span class="shrink-0 tabular-nums text-sf-text-2">{{ segment.percent }}%</span>
        <span v-if="segment.detail" class="shrink-0 tabular-nums text-sf-text-3">{{ segment.detail }}</span>
      </li>
    </ul>
  </div>
</template>
