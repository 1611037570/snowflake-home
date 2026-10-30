<script setup lang="ts">
import { computed } from "vue";
import type { ResumeReport } from "@snowflake/resume-agent";

const props = defineProps<{
  report: ResumeReport; // 根据实际草稿差异整理的报告。
  incomplete: boolean; // 部分草稿不能展示为整份优化成功。
}>();

// 六维固定顺序，与雷达图轴顺序一致。
const DIMENSION_KEYS = ["信息完整度", "阅读效率", "职业契合度", "职业成就", "发展潜力", "职业稳定性"];
// 总分只做粗略归纳，阈值按百分制四档划分，不参与任何筛选判断。
const grade = computed(() => {
  const score = props.report.totalScore;
  if (score == null) return "";
  if (score >= 85) return "竞争力强";
  if (score >= 70) return "基础扎实";
  if (score >= 55) return "仍有短板";
  return "建议重写";
});

// 环形进度按周长换算，半径固定避免不同分数跳动。
const RING_RADIUS = 42;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const ringDash = computed(() => {
  const score = props.report.totalScore ?? 0;
  return `${(score / 100) * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`;
});

// 雷达图按百分制半径等比换算，六轴从正上方开始均匀分布。
const RADAR_CENTER = 110;
const RADAR_RADIUS = 78;
const RADAR_LEVELS = [0.25, 0.5, 0.75, 1];
const radarPoint = (index: number, ratio: number) => {
  const angle = ((index * 60 - 90) * Math.PI) / 180;
  return {
    x: Number((RADAR_CENTER + RADAR_RADIUS * ratio * Math.cos(angle)).toFixed(1)),
    y: Number((RADAR_CENTER + RADAR_RADIUS * ratio * Math.sin(angle)).toFixed(1)),
  };
};
// 缺分维度会把形状拉向圆心造成误读，六维齐全时才画雷达图。
const allScored = computed(() => props.report.dimensions.every((item) => item.score != null));
const radarRings = computed(() => RADAR_LEVELS.map((level) =>
  DIMENSION_KEYS.map((_, index) => radarPoint(index, level)).map((point) => `${point.x},${point.y}`).join(" ")));
// 六条轴线固定按满分半径绘制，不随分数变化。
const radarAxes = computed(() => DIMENSION_KEYS.map((_, index) => radarPoint(index, 1)));
const radarShape = computed(() => props.report.dimensions.map((item, index) => radarPoint(index, (item.score ?? 0) / 100)));
const radarPolygon = computed(() => radarShape.value.map((point) => `${point.x},${point.y}`).join(" "));
</script>

<template>
  <article class="flex flex-col gap-3 text-sf-text">
    <!-- 报告使用本地组件呈现，模型只提供数据，不控制布局或生成 HTML。 -->
    <header class="flex flex-wrap items-start gap-3 rounded-2xl border border-sf-b bg-sf-bg p-3">
      <div class="relative flex h-24 w-24 shrink-0 items-center justify-center">
        <svg viewBox="0 0 100 100" class="h-24 w-24 -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" :r="RING_RADIUS" fill="none" stroke-width="8" class="stroke-sf-bg-2" />
          <circle cx="50" cy="50" :r="RING_RADIUS" fill="none" stroke-width="8" stroke-linecap="round" :stroke-dasharray="ringDash" class="stroke-sf-theme" />
        </svg>
        <div class="absolute flex flex-col items-center">
          <strong class="text-2xl font-semibold">{{ report.totalScore ?? '—' }}</strong>
          <span class="text-xs text-sf-text-3">综合评分</span>
        </div>
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-base font-semibold">{{ incomplete ? '部分结果说明' : '优化报告' }}</h2>
          <span v-if="grade" class="rounded-full bg-sf-theme-3 px-3 py-1 text-xs text-sf-theme">{{ grade }}</span>
        </div>
        <p class="text-sm leading-6 text-sf-text-2">{{ report.summary }}</p>
        <div class="flex flex-wrap items-center gap-3 text-xs text-sf-text-3">
          <span class="rounded-full bg-sf-primary px-3 py-1">改动 {{ report.changes.length }} 处</span>
          <span class="rounded-full bg-sf-primary px-3 py-1">待补充 {{ report.todo.length }} 条</span>
          <span class="rounded-full bg-sf-primary px-3 py-1">仍关注 {{ report.checks.length }} 条</span>
        </div>
        <p class="flex items-center gap-3 text-xs leading-6" :class="incomplete ? 'text-sf-warning' : 'text-sf-text-3'">
          <SfIcon :icon="incomplete ? 'lucide:triangle-alert' : 'lucide:file-text'" size="4" class="shrink-0" />
          {{ incomplete ? '尚未完成整份简历复核，以下仅为已校验的部分草稿' : report.changes.length ? '以下修改仅在草稿中，保存后才写入原简历' : '本次检查未修改简历' }}
        </p>
      </div>
    </header>

    <section v-if="report.dimensions.some((item) => item.score != null)" class="flex flex-col gap-3 rounded-xl border border-sf-b bg-sf-primary p-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-sm font-semibold">六维评估</h3>
        <span class="text-xs text-sf-text-3">满分 100，缺少依据的维度不计入总分</span>
      </div>
      <div class="grid items-center gap-3" :class="allScored ? 'md:grid-cols-2' : ''">
        <div v-if="allScored" class="flex items-center justify-center rounded-xl bg-sf-bg p-3">
          <svg viewBox="0 0 220 220" class="h-54 w-54" role="img" aria-label="六维评分雷达图">
            <polygon v-for="(ring, index) in radarRings" :key="index" :points="ring" fill="none" stroke-width="1" class="stroke-sf-b" />
            <line v-for="(axis, index) in radarAxes" :key="index" :x1="RADAR_CENTER" :y1="RADAR_CENTER" :x2="axis.x" :y2="axis.y" stroke-width="1" class="stroke-sf-b" />
            <polygon :points="radarPolygon" stroke-width="2" class="fill-sf-theme-3 stroke-sf-theme" />
            <circle v-for="(point, index) in radarShape" :key="index" :cx="point.x" :cy="point.y" r="3" class="fill-sf-theme" />
          </svg>
        </div>
        <div class="flex flex-col gap-3">
          <div v-for="dimension in report.dimensions" :key="dimension.name" class="flex flex-col gap-3">
            <div class="flex items-center justify-between gap-3 text-xs">
              <span class="text-sf-text-2">{{ dimension.name }}</span>
              <strong class="text-sm font-semibold" :class="dimension.score == null ? 'text-sf-text-3' : ''">{{ dimension.score ?? '不适用' }}</strong>
            </div>
            <div class="h-[6px] overflow-hidden rounded-full bg-sf-bg-2"><div class="h-full rounded-full bg-sf-theme" :style="{ width: `${dimension.score ?? 0}%` }" /></div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="report.changes.length" class="flex flex-col gap-3">
      <h3 class="text-sm font-semibold">本次修改了 {{ report.changes.length }} 处</h3>
      <div class="grid gap-3 md:grid-cols-2">
        <article v-for="change in report.changes" :key="change.module" class="flex flex-col gap-3 rounded-xl border border-sf-b bg-sf-primary p-3">
          <div class="flex items-center justify-between gap-3">
            <h4 class="text-sm font-medium">{{ change.module }}</h4>
            <span class="rounded-full bg-sf-success-2 px-3 py-1 text-xs text-sf-success">已改写</span>
          </div>
          <p v-if="change.problem" class="rounded-xl bg-sf-bg p-3 text-xs leading-6 text-sf-text-2"><span class="text-sf-text-3">原问题：</span>{{ change.problem }}</p>
          <p class="text-sm leading-6">{{ change.summary }}</p>
          <!-- 默认报告只展示结果说明，原文和改后内容统一在“查看对比”中查看。 -->
          <p v-if="change.benefit" class="border-l-2 border-sf-theme pl-3 text-xs leading-6 text-sf-theme">{{ change.benefit }}</p>
        </article>
      </div>
    </section>

    <section v-if="report.highlights.length" class="rounded-xl bg-sf-theme-3 p-3">
      <h3 class="flex items-center gap-3 text-sm font-semibold text-sf-theme"><SfIcon icon="lucide:sparkles" size="4" />优化亮点</h3>
      <ul class="mt-3 flex flex-col gap-3 text-sm leading-6"><li v-for="item in report.highlights" :key="item">{{ item }}</li></ul>
    </section>

    <section v-if="report.checks.length" class="flex flex-col gap-3">
      <h3 class="text-sm font-semibold">仍需关注</h3>
      <ul class="grid gap-3 md:grid-cols-2">
        <li v-for="(check, index) in report.checks" :key="index" class="flex items-start gap-3 rounded-xl border border-sf-b bg-sf-primary p-3 text-sm leading-6">
          <SfIcon :icon="check.level === 'error' ? 'lucide:circle-alert' : 'lucide:triangle-alert'" size="5" class="mt-[3px] shrink-0" :class="check.level === 'error' ? 'text-sf-error' : 'text-sf-warning'" />
          <span>{{ check.message }}</span>
        </li>
      </ul>
    </section>

    <div v-if="report.todo.length || report.suggestions.length" class="grid gap-3 md:grid-cols-2">
      <section v-if="report.todo.length" class="flex flex-col gap-3 rounded-xl border border-sf-b bg-sf-primary p-3">
        <h3 class="text-sm font-semibold">补充这些事实，会更有说服力</h3>
        <ul class="flex flex-col gap-3">
          <li v-for="(item, index) in report.todo" :key="index" class="flex items-start gap-3 text-sm leading-6 text-sf-text-2"><span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sf-warning-2 text-xs text-sf-warning">{{ index + 1 }}</span>{{ item }}</li>
        </ul>
      </section>
      <section v-if="report.suggestions.length" class="flex flex-col gap-3 rounded-xl border border-sf-b bg-sf-primary p-3">
        <h3 class="text-sm font-semibold">下一步建议</h3>
        <ul class="flex flex-col gap-3">
          <li v-for="(item, index) in report.suggestions" :key="index" class="flex items-start gap-3 text-sm leading-6 text-sf-text-2"><span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sf-theme-3 text-xs text-sf-theme">{{ index + 1 }}</span>{{ item }}</li>
        </ul>
      </section>
    </div>
  </article>
</template>
