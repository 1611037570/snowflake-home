<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAiUsage, type AiUsageRecord } from "@/apis/llm/usage";

const { t, locale } = useI18n();
const { records, completedCount, totalTokens, tokenUsagePartial, loading, ready, loadError, saveError, load, retry } = useAiUsage();
const visibleCount = ref(20);
const visibleRecords = computed(() => records.value.slice(0, visibleCount.value));
const roleLabels: Record<AiUsageRecord["agent"], string> = {
  xiaoZhou: "resumeAiUsageRoleResume", // 简历助手角色名称。
  xiaoYang: "resumeAiUsageRoleInterview", // 面试官角色名称。
  resumeParser: "resumeAiUsageRoleParser", // 简历解析角色名称。
};
const statusLabels: Record<AiUsageRecord["status"], string> = {
  success: "resumeAiUsageSuccess", // 正常完成调用。
  error: "resumeAiUsageFailed", // 调用失败。
  aborted: "resumeAiUsageStopped", // 用户主动停止。
  timeout: "resumeAiUsageTimeout", // 请求超时。
};
const formatTime = (time: number) => new Intl.DateTimeFormat(locale.value, {
  month: "2-digit", // 展示月份。
  day: "2-digit", // 展示日期。
  hour: "2-digit", // 展示小时。
  minute: "2-digit", // 展示分钟。
}).format(time);
const formatDuration = (record: AiUsageRecord) => t("resumeAiUsageDuration", {
  seconds: (Math.max(0, record.endedAt - record.startedAt) / 1000).toFixed(1), // 按实际开始结束时间展示秒数。
});
// 不完整用量只展示已知下限，服务商未提供的值不能渲染成零。
const formatTokens = (value: number | null | undefined, partial = false) => value == null ? t("resumeAiUsageTokensUnavailable") : `${partial ? '≥ ' : ''}${value.toLocaleString(locale.value)}`;
const hasTokenDetails = (record: AiUsageRecord) => !!record.tokens && [record.tokens.inputTokens, record.tokens.outputTokens, record.tokens.cachedTokens].some((value) => value !== null);
// 只读取个人历史，不在页面访问时发起模型调用或上报。
void load();
</script>

<template>
  <SfScrollbar flush class="h-full bg-sf-page">
    <main class="flex min-h-full w-full min-w-0 flex-col gap-3 p-3 text-sf-text">
      <header>
        <h1 class="text-lg font-semibold text-sf-text">{{ t("resumeNavAiUsage") }}</h1>
        <p class="mt-[6px] text-xs leading-6 text-sf-text-2">{{ t("resumeAiUsageDescription") }}</p>
      </header>
      <section class="flex flex-wrap items-center gap-3 rounded-2xl border border-sf-b bg-sf-primary p-3">
        <div class="flex flex-wrap items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-sf-bg text-sf-theme"><SfIcon icon="lucide:sparkles" size="5" /></span>
          <span class="text-sm text-sf-text-2">{{ t("resumeAiUsageCompleted") }}</span>
          <strong class="text-2xl font-semibold tabular-nums text-sf-theme">{{ ready ? completedCount.toLocaleString(locale) : '—' }}</strong>
          <span class="text-sm text-sf-text-2">{{ t("resumeAiUsageTimes") }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm text-sf-text-2">{{ t("resumeAiUsageTotalTokens") }}</span>
          <strong class="text-2xl font-semibold tabular-nums text-sf-theme">{{ ready ? formatTokens(totalTokens, tokenUsagePartial) : '—' }}</strong>
          <SfTooltip v-if="ready && tokenUsagePartial" :content="t('resumeAiUsagePartialTokens')"><SfIcon icon="ph:info-duotone" size="4" class="text-sf-text-2" /></SfTooltip>
        </div>
      </section>
      <p v-if="loadError || saveError" class="flex flex-wrap items-center gap-3 rounded-xl border border-sf-b bg-sf-primary p-3 text-sm text-sf-error" role="alert">
        {{ t(loadError ? "resumeAiUsageLoadError" : "resumeAiUsageSaveError") }}
        <SfButton type="bg" :disabled="loading" @click="retry">{{ t("resumeAiUsageRetry") }}</SfButton>
      </p>
      <section class="min-w-0 rounded-2xl border border-sf-b bg-sf-primary p-3">
        <h2 class="text-sm font-semibold">{{ t("resumeAiUsageRecent") }}</h2>
        <p v-if="loading" class="mt-3 flex items-center gap-3 text-sm text-sf-text-2" role="status"><SfIcon icon="eos-icons:loading" size="5" />{{ t("resumeAiUsageLoading") }}</p>
        <div v-else-if="ready && !records.length" class="flex min-h-36 flex-col items-center justify-center gap-3 text-center">
          <p class="text-sm text-sf-text-2">{{ t("resumeAiUsageEmpty") }}</p>
          <RouterLink to="/resume/generate" class="text-sm text-sf-theme hover:underline">{{ t("resumeAiUsageStart") }}</RouterLink>
        </div>
        <ol v-else class="mt-3 divide-y divide-sf-b">
          <li v-for="record in visibleRecords" :key="record.id" class="flex flex-col gap-3 py-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="break-words text-sm font-medium">{{ record.model }}</p>
                <p class="mt-3 text-xs text-sf-text-2">{{ t(roleLabels[record.agent]) }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-3 text-xs text-sf-text-2">
                <span class="font-medium tabular-nums text-sf-text">{{ formatTokens(record.tokens?.totalTokens, record.tokens?.partial.includes('totalTokens')) }} Token</span>
                <span :class="record.status === 'success' ? 'text-sf-success' : record.status === 'aborted' ? 'text-sf-text-2' : 'text-sf-error'">{{ t(statusLabels[record.status]) }}</span>
                <span>{{ formatDuration(record) }}</span>
                <time :datetime="new Date(record.endedAt).toISOString()">{{ formatTime(record.endedAt) }}</time>
              </div>
            </div>
            <details v-if="hasTokenDetails(record)" class="text-xs text-sf-text-2">
              <summary class="cursor-pointer">{{ t("resumeAiUsageTokenDetails") }}</summary>
              <dl class="mt-3 flex flex-wrap gap-3">
                <div class="flex gap-3"><dt>{{ t("resumeAiUsageInputTokens") }}</dt><dd class="tabular-nums">{{ formatTokens(record.tokens?.inputTokens, record.tokens?.partial.includes('inputTokens')) }}</dd></div>
                <div class="flex gap-3"><dt>{{ t("resumeAiUsageOutputTokens") }}</dt><dd class="tabular-nums">{{ formatTokens(record.tokens?.outputTokens, record.tokens?.partial.includes('outputTokens')) }}</dd></div>
                <div v-if="record.tokens?.cachedTokens != null" class="flex gap-3"><dt>{{ t("resumeAiUsageCachedTokens") }}</dt><dd class="tabular-nums">{{ formatTokens(record.tokens?.cachedTokens, record.tokens?.partial.includes('cachedTokens')) }}</dd></div>
              </dl>
            </details>
          </li>
        </ol>
        <SfButton v-if="visibleRecords.length < records.length" type="bg" class="mt-3" @click="visibleCount += 20">{{ t("resumeAiUsageMore") }}</SfButton>
      </section>
    </main>
  </SfScrollbar>
</template>
