<script setup lang="ts">
import type { ResumeReport } from "@snowflake/resume-agent";

defineProps<{
  report: ResumeReport; // 根据实际草稿差异整理的报告。
  accepted: boolean; // 用户已确认保存，结果已经写入本地状态。
  incomplete: boolean; // 部分草稿不能展示为整份优化成功。
}>();
</script>

<template>
  <article class="flex flex-col gap-3 text-sf-text">
    <!-- 报告使用本地组件呈现，模型只提供数据，不控制布局或生成 HTML。 -->
    <header class="rounded-xl border border-sf-b bg-sf-bg p-3">
      <div class="flex items-center justify-between gap-3"><h2 class="text-sm font-semibold">{{ incomplete ? '部分结果说明' : '优化报告' }}</h2><span v-if="report.totalScore != null" class="text-xs text-sf-text-3">参考评分 <strong class="text-lg text-sf-text">{{ report.totalScore }}</strong></span></div>
      <p class="mt-3 text-sm leading-6 text-sf-text-2">{{ report.summary }}</p>
      <p class="mt-3 text-xs" :class="accepted ? 'text-sf-success' : 'text-sf-text-3'">{{ accepted ? '优化结果已写入，等待保存完成' : incomplete ? '尚未完成整份简历复核，以下仅为已校验的部分草稿' : report.changes.length ? '以下修改仅在草稿中，保存后才写入原简历' : '本次检查未修改简历' }}</p>
    </header>

    <details v-if="report.dimensions.some((item) => item.score != null)" class="rounded-xl border border-sf-b p-3">
      <summary class="cursor-pointer text-sm font-medium">六维评估</summary>
      <div class="mt-3 grid grid-cols-2 gap-3">
        <div v-for="dimension in report.dimensions" :key="dimension.name">
          <div class="flex items-center justify-between gap-3 text-xs"><span class="text-sf-text-2">{{ dimension.name }}</span><strong class="font-semibold">{{ dimension.score ?? '不适用' }}</strong></div>
          <div class="mt-3 h-[6px] overflow-hidden rounded-full bg-sf-bg-2"><div class="h-full rounded-full bg-sf-theme" :style="{ width: `${dimension.score ?? 0}%` }" /></div>
        </div>
      </div>
      <p class="mt-3 text-xs leading-6 text-sf-text-3">评分仅反映简历中已有信息，不代表招聘结果；缺少判断依据的维度不计入总分。</p>
    </details>

    <section v-if="report.changes.length">
      <h3 class="mb-3 text-sm font-semibold">本次优化了什么</h3>
      <div class="flex flex-col gap-3">
        <article v-for="change in report.changes" :key="change.module" class="rounded-xl border border-sf-b p-3">
          <h4 class="text-sm font-medium">{{ change.module }}</h4>
          <p class="mt-3 text-xs leading-6 text-sf-text-2">{{ change.problem || change.summary }}</p>
          <p v-if="change.problem" class="mt-3 text-xs leading-6">{{ change.summary }}</p>
          <!-- 默认报告只展示结果说明，原文和改后内容统一在“查看对比”中查看。 -->
          <p v-if="change.benefit" class="mt-3 text-xs leading-6 text-sf-theme">{{ change.benefit }}</p>
        </article>
      </div>
    </section>

    <section v-if="report.highlights.length" class="rounded-2xl bg-sf-theme-3 p-3">
      <h3 class="mb-3 flex items-center gap-3 text-sm font-semibold text-sf-theme"><SfIcon icon="lucide:sparkles" size="4" />优化亮点</h3>
      <ul class="flex flex-col gap-3 text-sm leading-6"><li v-for="item in report.highlights" :key="item">{{ item }}</li></ul>
    </section>

    <section v-if="report.checks.length">
      <h3 class="mb-3 text-sm font-semibold">仍需关注</h3>
      <ul class="flex flex-col gap-3"><li v-for="(check, index) in report.checks" :key="index" class="flex items-start gap-3 rounded-xl bg-sf-bg p-3 text-sm leading-6"><SfIcon :icon="check.level === 'error' ? 'lucide:circle-alert' : 'lucide:triangle-alert'" size="5" class="mt-[3px] shrink-0" :class="check.level === 'error' ? 'text-sf-error' : 'text-sf-warning'" /><span>{{ check.message }}</span></li></ul>
    </section>

    <div v-if="report.todo.length || report.suggestions.length" class="grid gap-3">
      <section v-if="report.todo.length"><h3 class="mb-3 text-sm font-semibold">补充这些事实，会更有说服力</h3><ul class="flex flex-col gap-3"><li v-for="(item, index) in report.todo" :key="index" class="flex gap-3 text-sm leading-6 text-sf-text-2"><span class="text-sf-warning">{{ index + 1 }}.</span>{{ item }}</li></ul></section>
      <section v-if="report.suggestions.length"><h3 class="mb-3 text-sm font-semibold">下一步建议</h3><ul class="flex flex-col gap-3"><li v-for="(item, index) in report.suggestions" :key="index" class="flex gap-3 text-sm leading-6 text-sf-text-2"><span class="text-sf-theme">{{ index + 1 }}.</span>{{ item }}</li></ul></section>
    </div>
  </article>
</template>
