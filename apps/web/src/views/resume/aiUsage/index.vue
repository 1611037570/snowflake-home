<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { AI_USAGE_AGENTS, pruneAiUsageModels, useAiUsage, type AiUsageStats } from "@/apis/llm/usage";
import { useAiStore } from "@/stores";
import type { AiAgentKey } from "@/stores/modules/ai";
import UsageShareBar from "./usageShareBar.vue";

const { t, locale } = useI18n();
const route = useRoute();
const { stats, loading, ready, loadError, saveError, load, retry } = useAiUsage();
const aiStore = useAiStore();

const roleLabels: Record<AiAgentKey, string> = {
  xiaoZhou: "resumeAiUsageRoleResume", // 简历助手角色名称。
  xiaoYang: "resumeAiUsageRoleInterview", // 面试官角色名称。
  resumeParser: "resumeAiUsageRoleParser", // 简历解析角色名称。
};

// 排查用示例数据：三个角色、多个模型、失败次数与跨天时间都有，用来确认展示是否完整。
const PREVIEW_STATS: AiUsageStats = {
  xiaoZhou: {
    count: 18,
    failed: 2,
    totalTokens: 128400,
    updatedAt: Date.now() - 12 * 60 * 1000,
    models: {
      "deepseek-v4-flash": { count: 11, totalTokens: 86200 },
      "gpt-4o-mini": { count: 7, totalTokens: 42200 },
    },
  },
  xiaoYang: {
    count: 6,
    failed: 1,
    totalTokens: 41300,
    updatedAt: Date.now() - 3 * 60 * 60 * 1000,
    models: {
      "claude-sonnet-4": { count: 6, totalTokens: 41300 },
    },
  },
  resumeParser: {
    count: 9,
    failed: 0,
    totalTokens: 22700,
    updatedAt: Date.now() - 26 * 60 * 60 * 1000,
    models: {
      "deepseek-v4-flash": { count: 8, totalTokens: 20100 },
      "qwen-max": { count: 1, totalTokens: 2600 },
    },
  },
};

// 带 ?preview 时展示示例数据，用于确认展示是否完整，不影响真实记录。
const preview = computed(() => route.query.preview !== undefined);
const source = computed(() => preview.value ? PREVIEW_STATS : stats.value);
const showNumbers = computed(() => preview.value || ready.value);
const totalCount = computed(() => AI_USAGE_AGENTS.reduce((total, agent) => total + source.value[agent].count, 0));
const totalTokens = computed(() => AI_USAGE_AGENTS.reduce((total, agent) => total + source.value[agent].totalTokens, 0));

const formatNumber = (value: number) => value.toLocaleString(locale.value);

// 顶部按角色分布，只用有点数的角色，避免图例出现 0%。
const roleShares = computed(() => AI_USAGE_AGENTS
  .map((agent) => ({ key: agent, label: t(roleLabels[agent]), value: source.value[agent].totalTokens }))
  .filter((item) => item.value > 0));

// 每个角色一行，模型按用量降序，图例附带各自的调用次数。
const rows = computed(() => AI_USAGE_AGENTS.map((agent) => {
  const stat = source.value[agent];
  return {
    agent, // 当前行的业务角色
    stat, // 该角色的累计数据
    models: Object.entries(stat.models)
      .map(([model, usage]) => ({
        key: model,
        label: model,
        value: usage.totalTokens,
        detail: `${formatNumber(usage.count)} ${t("resumeAiUsageTimes")}`,
      }))
      .filter((item) => item.value > 0)
      .sort((left, right) => right.value - left.value),
  };
}));

const formatTime = (time: number) => time
  ? new Intl.DateTimeFormat(locale.value, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(time)
  : t("resumeAiUsageNeverUsed");

// 失效模型：统计里还留着、但当前模型配置已经删掉的条目。
const staleCount = computed(() => {
  const valid = new Set(aiStore.modelList.map((item) => item.model));
  return AI_USAGE_AGENTS.reduce((total, agent) =>
    total + Object.keys(stats.value[agent].models).filter((model) => !valid.has(model)).length, 0);
});
// 清理失效模型，角色合计同步扣除这些模型的次数与 Token。
const pruneModels = () => {
  pruneAiUsageModels(aiStore.modelList.map((item) => item.model));
};
// 只读取本地累计值，不在页面访问时发起模型调用或上报。
void load();
</script>

<template>
  <SfScrollbar flush class="h-full bg-sf-page">
    <main class="flex min-h-full w-full min-w-0 flex-col gap-3 p-3 text-sf-text">
      <header>
        <h1 class="text-lg font-semibold text-sf-text">{{ t("resumeNavAiUsage") }}</h1>
        <p class="mt-[6px] text-xs leading-6 text-sf-text-2">{{ t("resumeAiUsageDescription") }}</p>
        <p v-if="preview" class="mt-[6px] text-xs leading-6 text-sf-warning">{{ t("resumeAiUsagePreviewHint") }}</p>
      </header>
      <section class="flex flex-col gap-3 rounded-2xl border border-sf-b bg-sf-primary p-3">
        <div class="flex flex-wrap items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-sf-bg text-sf-theme"><SfIcon icon="lucide:sparkles" size="5" /></span>
          <span class="text-sm text-sf-text-2">{{ t("resumeAiUsageCompleted") }}</span>
          <strong class="text-2xl font-semibold tabular-nums text-sf-theme">{{ showNumbers ? formatNumber(totalCount) : '—' }}</strong>
          <span class="text-sm text-sf-text-2">{{ t("resumeAiUsageTimes") }}</span>
          <span class="text-sm text-sf-text-2">{{ t("resumeAiUsageTotalTokens") }}</span>
          <strong class="text-2xl font-semibold tabular-nums text-sf-theme">{{ showNumbers ? formatNumber(totalTokens) : '—' }}</strong>
        </div>
        <UsageShareBar v-if="roleShares.length" :items="roleShares" />
      </section>
      <p v-if="!preview && (loadError || saveError)" class="flex flex-wrap items-center gap-3 rounded-xl border border-sf-b bg-sf-primary p-3 text-sm text-sf-error" role="alert">
        {{ t(loadError ? "resumeAiUsageLoadError" : "resumeAiUsageSaveError") }}
        <SfButton type="bg" :disabled="loading" @click="retry">{{ t("resumeAiUsageRetry") }}</SfButton>
      </p>
      <p v-if="!preview && loading" class="flex items-center gap-3 rounded-xl border border-sf-b bg-sf-primary p-3 text-sm text-sf-text-2" role="status">
        <SfIcon icon="eos-icons:loading" size="5" />{{ t("resumeAiUsageLoading") }}
      </p>
      <div v-else-if="showNumbers && !totalCount && !totalTokens" class="flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border border-sf-b bg-sf-primary text-center">
        <p class="text-sm text-sf-text-2">{{ t("resumeAiUsageEmpty") }}</p>
        <RouterLink to="/resume/generate" class="text-sm text-sf-theme hover:underline">{{ t("resumeAiUsageStart") }}</RouterLink>
      </div>
      <section v-else class="flex flex-col gap-3">
        <article v-for="row in rows" :key="row.agent" class="flex flex-col gap-3 rounded-2xl border border-sf-b bg-sf-primary p-3">
          <header class="flex flex-wrap items-center justify-between gap-3">
            <span class="text-sm font-medium">{{ t(roleLabels[row.agent]) }}</span>
            <span class="text-xs text-sf-text-2">{{ t("resumeAiUsageLastUsed") }} {{ formatTime(row.stat.updatedAt) }}</span>
          </header>
          <dl class="flex flex-wrap gap-3 text-xs text-sf-text-2">
            <div class="flex gap-[3px]"><dt>{{ t("resumeAiUsageCount") }}</dt><dd class="tabular-nums text-sf-text">{{ formatNumber(row.stat.count) }}</dd></div>
            <div class="flex gap-[3px]"><dt>{{ t("resumeAiUsageFailedCount") }}</dt><dd class="tabular-nums text-sf-text">{{ formatNumber(row.stat.failed) }}</dd></div>
            <div class="flex gap-[3px]"><dt>{{ t("resumeAiUsageTokens") }}</dt><dd class="tabular-nums text-sf-text">{{ formatNumber(row.stat.totalTokens) }}</dd></div>
          </dl>
          <UsageShareBar v-if="row.models.length" :items="row.models" />
        </article>
        <SfButton v-if="!preview && staleCount" type="bg" border class="self-start" @click="pruneModels">
          {{ t("resumeAiUsagePruneModels", { count: staleCount }) }}
        </SfButton>
      </section>
    </main>
  </SfScrollbar>
</template>
