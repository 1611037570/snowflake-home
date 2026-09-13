<script setup>
import { computed } from "vue";
import SfEcharts from "@/components/business/echarts";

const props = defineProps({
  report: { type: Object, required: true },
});

// 雷达图配置：按五个固定维度绘制能力雷达
const radarOptions = computed(() => {
  const dims = props.report.dimensions || [];
  return {
    title: { show: false },
    legend: { show: false },
    radar: {
      indicator: dims.map((d) => ({ name: d.name, max: 100 })),
      radius: "65%",
      center: ["50%", "55%"],
      axisName: { color: "#8a8f98", fontSize: 12 },
      splitArea: { areaStyle: { color: ["transparent"] } },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.06)" } },
      axisLine: { lineStyle: { color: "rgba(0,0,0,0.06)" } },
    },
    series: [
      {
        type: "radar",
        symbol: "circle",
        symbolSize: 4,
        data: [
          {
            value: dims.map((d) => d.score),
            areaStyle: { opacity: 0.2 },
            lineStyle: { width: 2 },
          },
        ],
      },
    ],
  };
});

// 总分评级
const level = computed(() => {
  const s = props.report.totalScore;
  if (s >= 90) return "优秀";
  if (s >= 80) return "良好";
  if (s >= 70) return "中等";
  if (s >= 60) return "及格";
  return "待提升";
});
</script>

<template>
  <div class="w-full max-w-full overflow-hidden rounded-3xl border border-sf-b bg-sf-bg p-3">
    <!-- 综合评分与雷达图 -->
    <div class="flex items-center gap-3">
      <SfEcharts :options="radarOptions" class="h-52 w-2/3!" />
      <div class="flex w-1/3 flex-col items-center justify-center gap-3">
        <span class="text-[40px] font-black leading-none text-sf-theme">{{ report.totalScore }}</span>
        <span class="text-[13px] text-sf-text-2">综合评分 · {{ level }}</span>
      </div>
    </div>

    <!-- 分维度得分 -->
    <div class="mt-6 flex flex-col gap-3">
      <div v-for="d in report.dimensions" :key="d.name" class="flex items-center gap-3">
        <span class="w-20 shrink-0 text-[13px] text-sf-text-2">{{ d.name }}</span>
        <div class="h-2 flex-1 overflow-hidden rounded-full bg-sf-bg-2">
          <div class="h-full rounded-full bg-sf-theme" :style="{ width: d.score + '%' }" />
        </div>
        <span class="w-8 shrink-0 text-right text-[13px] font-medium text-sf-text">{{ d.score }}</span>
      </div>
    </div>

    <!-- 体检问题清单 -->
    <div v-if="report.checks?.length" class="mt-6">
      <div class="mb-3 text-[14px] font-medium text-sf-text">体检诊断</div>
      <div class="flex flex-col gap-3">
        <div v-for="(c, i) in report.checks" :key="i" class="flex items-center gap-3">
          <span
            class="h-2 w-2 shrink-0 rounded-full"
            :style="{ background: c.level === 'error' ? '#ef4444' : '#f59e0b' }"
          />
          <span class="text-[13px] leading-relaxed text-sf-text">{{ c.message }}</span>
        </div>
      </div>
    </div>

    <!-- 改动清单 -->
    <div v-if="report.changes?.length" class="mt-6">
      <div class="mb-3 text-[14px] font-medium text-sf-text">本次改动</div>
      <div class="flex flex-col gap-3">
        <div v-for="(c, i) in report.changes" :key="i" class="flex items-center gap-3">
          <span class="shrink-0 rounded-md bg-sf-bg-2 px-3 text-[12px] text-sf-text-2">{{ c.module }}</span>
          <span class="text-[13px] leading-relaxed text-sf-text">{{ c.summary }}</span>
        </div>
      </div>
    </div>

    <!-- 待补充清单 -->
    <div v-if="report.todo?.length" class="mt-6">
      <div class="mb-3 text-[14px] font-medium text-sf-text">待补充</div>
      <div class="flex flex-col gap-3">
        <div v-for="(t, i) in report.todo" :key="i" class="flex items-start gap-3">
          <span class="text-[13px] leading-relaxed text-sf-theme">{{ i + 1 }}.</span>
          <span class="text-[13px] leading-relaxed text-sf-text">{{ t }}</span>
        </div>
      </div>
    </div>

    <!-- 优化亮点 -->
    <div v-if="report.highlights?.length" class="mt-6">
      <div class="mb-3 text-[14px] font-medium text-sf-text">优化亮点</div>
      <div class="flex flex-col gap-3">
        <div v-for="(h, i) in report.highlights" :key="i" class="flex items-start gap-3">
          <span class="text-[13px] leading-relaxed text-sf-theme">✓</span>
          <span class="text-[13px] leading-relaxed text-sf-text">{{ h }}</span>
        </div>
      </div>
    </div>

    <!-- 下一步建议 -->
    <div v-if="report.suggestions?.length" class="mt-6">
      <div class="mb-3 text-[14px] font-medium text-sf-text">下一步建议</div>
      <div class="flex flex-col gap-3">
        <div v-for="(s, i) in report.suggestions" :key="i" class="flex items-start gap-3">
          <span class="text-[13px] leading-relaxed text-sf-theme">{{ i + 1 }}.</span>
          <span class="text-[13px] leading-relaxed text-sf-text">{{ s }}</span>
        </div>
      </div>
    </div>
  </div>
</template>