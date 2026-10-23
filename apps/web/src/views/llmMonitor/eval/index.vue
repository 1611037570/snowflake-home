<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useClipboard } from "@vueuse/core";
import { evalCases, evalGroups } from "./cases";
import { clearRuns } from "./storage";
import { useEvalRun } from "./useEvalRun";
import type { EvalCase, EvalResult } from "./types";

defineOptions({ name: "ResumeEvalPanel" });

// 工具名到动作的中文说明，便于使用方直接读懂轨迹
const TOOL_LABELS: Record<string, string> = {
  plan_resume_task: "理解需求",
  request_resume_input: "确认补充信息",
  report_resume_blocker: "记录阻塞原因",
  read_resume_data: "读取简历",
  propose_resume_edits: "写入简历",
  read_resume_guidance: "查阅写作知识",
  update_resume_language: "同步简历语言",
};

const {
  running,
  currentCaseId,
  liveResults,
  runs,
  modelReady,
  modelName,
  dailyLeft,
  dailyLimit,
  batchLimit,
  startRun,
  stopRun,
  refreshModelState,
  ensureRunsLoaded,
} = useEvalRun();

// 默认全选用例，使用方只需点运行
const selectedIds = ref<string[]>(evalCases.map((item) => item.id));
const selectedId = ref(evalCases[0]?.id ?? "");
// 二次确认态：避免误点直接消耗额度
const confirming = ref(false);
const message = ref("");
let confirmTimer: ReturnType<typeof setTimeout> | null = null;

const lastRun = computed(() => runs.value[0]);

// 本次已有结果时展示本次，否则回落到上次运行记录
const displayResults = computed(() => {
  if (liveResults.value.length) return liveResults.value;
  return lastRun.value?.results ?? [];
});

const displayById = computed(() => {
  const map = new Map<string, EvalResult>();
  displayResults.value.forEach((item) => map.set(item.caseId, item));
  return map;
});

const selectedCase = computed(() => evalCases.find((item) => item.id === selectedId.value));
const selectedResult = computed(() =>
  selectedCase.value ? displayById.value.get(selectedCase.value.id) : undefined,
);

// 未运行过的用例也列出断言清单，便于先看清这条用例在验证什么
const assertionRows = computed<
  Array<{ label: string; passed: boolean | null; detail?: string }>
>(() => {
  if (selectedResult.value) return selectedResult.value.assertions;
  return (selectedCase.value?.assertions ?? []).map((item) => ({
    label: item.label,
    passed: null,
    detail: undefined,
  }));
});

const assertionText = (passed: boolean | null) =>
  passed === null ? "待验证" : passed ? "通过" : "不满足";

const assertionClass = (passed: boolean | null) => {
  if (passed === null) return "border-sf-border";
  return passed ? "border-sf-border" : "border-sf-error";
};

const assertionTextClass = (passed: boolean | null) => {
  if (passed === null) return "text-sf-text-2";
  return passed ? "text-sf-success" : "text-sf-error";
};

// 复制反馈：只标记最近一次复制的区块，便于确认是否成功
const { copy, isSupported } = useClipboard();
const copiedKey = ref("");

const copyBlock = async (key: string, text: string) => {
  if (!isSupported.value) return;
  await copy(text);
  copiedKey.value = key;
  setTimeout(() => {
    if (copiedKey.value === key) copiedKey.value = "";
  }, 1500);
};

const copyLabel = (key: string) => (copiedKey.value === key ? "已复制" : "复制");

// 改动对比与两份简历的可复制文本
const diffText = computed(() =>
  (selectedResult.value?.diff ?? [])
    .map((item) => `${item.path}\n- ${item.before || "（空）"}\n+ ${item.after || "（空）"}`)
    .join("\n\n"),
);

const resumeAfterText = computed(() =>
  JSON.stringify(selectedResult.value?.resumeAfter ?? {}, null, 2),
);

const resumeBeforeText = computed(() => JSON.stringify(selectedCase.value?.resume ?? {}, null, 2));

// 旧运行记录没有保存契约与差异，需要提示重新运行而不是显示成"没有改动"
const isLegacyResult = computed(() => Boolean(selectedResult.value) && selectedResult.value?.diff === undefined);

const selectedCount = computed(() => selectedIds.value.length);
const overLimit = computed(() => selectedCount.value > batchLimit);

const summary = computed(() => {
  const results = displayResults.value;
  if (!results.length) return null;
  const passed = results.filter((item) => item.passed).length;
  const durationMs = results.reduce((total, item) => total + item.durationMs, 0);
  const tokens = results.reduce((total, item) => total + item.tokens, 0);
  return {
    total: results.length,
    passed,
    rate: Math.round((passed / results.length) * 100),
    durationMs,
    tokens,
    at: liveResults.value.length ? Date.now() : lastRun.value?.startedAt ?? 0,
  };
});

const isSelected = (group: string) =>
  evalCases.filter((item) => item.group === group).every((item) => selectedIds.value.includes(item.id));

const toggleGroup = (group: string) => {
  const ids = evalCases.filter((item) => item.group === group).map((item) => item.id);
  selectedIds.value = isSelected(group)
    ? selectedIds.value.filter((id) => !ids.includes(id))
    : [...new Set([...selectedIds.value, ...ids])];
  confirming.value = false;
};

const statusOf = (evalCase: EvalCase) => {
  if (running.value && currentCaseId.value === evalCase.id) return { text: "运行中", class: "text-sf-theme" };
  const result = displayById.value.get(evalCase.id);
  if (!result) return { text: "未跑", class: "text-sf-text-2" };
  if (result.error) return { text: "异常", class: "text-sf-warning" };
  return result.passed
    ? { text: "通过", class: "text-sf-success" }
    : { text: "失败", class: "text-sf-error" };
};

const formatTime = (value?: number) => (value ? new Date(value).toLocaleString() : "—");
const formatDuration = (value: number) => `${(value / 1000).toFixed(1)}s`;

const requestRun = async () => {
  message.value = "";
  if (!confirming.value) {
    if (!selectedCount.value) {
      message.value = "请先选择要运行的用例";
      return;
    }
    if (overLimit.value) {
      message.value = `单次最多运行 ${batchLimit} 条用例`;
      return;
    }
    confirming.value = true;
    if (confirmTimer) clearTimeout(confirmTimer);
    confirmTimer = setTimeout(() => {
      confirming.value = false;
    }, 4000);
    return;
  }
  confirming.value = false;
  if (confirmTimer) clearTimeout(confirmTimer);
  const outcome = await startRun([...selectedIds.value]);
  if (!outcome.ok) message.value = outcome.reason ?? "无法开始评测";
};

const handleRefreshModel = () => {
  refreshModelState();
  message.value = modelReady.value ? "" : "尚未配置简历辅助模型，请先到 AI 设置中选择";
};

const handleClearRuns = async () => {
  await clearRuns();
  runs.value = [];
};

onMounted(async () => {
  refreshModelState();
  await ensureRunsLoaded();
});
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden p-3">
    <div class="mb-3 flex shrink-0 flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-lg font-bold text-sf-text">效果评测</h1>
        <p class="mt-3 text-sm text-sf-text-2">
          在隔离的简历快照上执行真实 Agent 链路，不读取也不修改当前简历；打开页面不会发起任何请求。
        </p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-sf-text-2">今日剩余 {{ dailyLeft }}/{{ dailyLimit }} 次</span>
        <button
          v-if="running"
          class="cursor-pointer rounded-lg border border-sf-border px-3 py-3 text-sm text-sf-text transition hover:bg-sf-bg-2"
          type="button"
          @click="stopRun"
        >
          停止
        </button>
        <button
          v-else
          class="cursor-pointer rounded-lg border px-3 py-3 text-sm transition hover:bg-sf-bg-2"
          :class="confirming ? 'border-sf-error text-sf-error' : 'border-sf-theme text-sf-text'"
          type="button"
          :disabled="!modelReady || !selectedCount"
          @click="requestRun"
        >
          {{ confirming ? `确认发起 ${selectedCount} 次请求` : "开始评测" }}
        </button>
      </div>
    </div>

    <div
      class="mb-3 flex shrink-0 flex-wrap items-center gap-3 rounded-lg border p-3"
      :class="modelReady ? 'border-sf-border' : 'border-sf-warning'"
    >
      <span class="text-sm text-sf-text">
        模型：{{ modelReady ? modelName || "已配置" : "未配置"
        }}<template v-if="lastRun"> · 上次：{{ formatTime(lastRun.startedAt) }}</template>
      </span>
      <button
        class="cursor-pointer text-sm text-sf-text-2 underline-offset-3 hover:text-sf-text"
        type="button"
        @click="handleRefreshModel"
      >
        重新检查模型
      </button>
      <button
        v-if="runs.length"
        class="cursor-pointer text-sm text-sf-text-2 underline-offset-3 hover:text-sf-text"
        type="button"
        @click="handleClearRuns"
      >
        清空历史
      </button>
      <span v-if="message" class="text-sm text-sf-warning">{{ message }}</span>
    </div>

    <div v-if="summary" class="mb-3 grid shrink-0 gap-3 sm:grid-cols-4">
      <div class="rounded-lg bg-sf-bg-2 p-3">
        <div class="text-sm text-sf-text-2">通过率</div>
        <div
          class="mt-3 font-medium"
          :class="summary.passed === summary.total ? 'text-sf-success' : 'text-sf-error'"
        >
          {{ summary.passed }}/{{ summary.total }} · {{ summary.rate }}%
        </div>
      </div>
      <div class="rounded-lg bg-sf-bg-2 p-3">
        <div class="text-sm text-sf-text-2">总耗时</div>
        <div class="mt-3 font-medium text-sf-text">{{ formatDuration(summary.durationMs) }}</div>
      </div>
      <div class="rounded-lg bg-sf-bg-2 p-3">
        <div class="text-sm text-sf-text-2">用量（近似）</div>
        <div class="mt-3 font-medium text-sf-text">{{ summary.tokens.toLocaleString() }}</div>
      </div>
      <div class="rounded-lg bg-sf-bg-2 p-3">
        <div class="text-sm text-sf-text-2">结果时间</div>
        <div class="mt-3 font-medium text-sf-text">{{ formatTime(summary.at) }}</div>
      </div>
    </div>

    <div class="mb-3 flex shrink-0 flex-wrap items-center gap-3">
      <span class="text-sm text-sf-text-2">分组</span>
      <button
        v-for="group in evalGroups"
        :key="group"
        class="cursor-pointer rounded-lg border px-3 py-3 text-sm transition hover:bg-sf-bg-2"
        :class="isSelected(group) ? 'border-sf-theme text-sf-text' : 'border-sf-border text-sf-text-2'"
        type="button"
        @click="toggleGroup(group)"
      >
        {{ group }}
      </button>
      <span class="text-sm text-sf-text-2">已选 {{ selectedCount }} 条</span>
    </div>

    <div class="grid min-h-0 flex-1 gap-3 lg:grid-cols-3">
      <section
        class="border-sf-border min-h-0 overflow-y-auto rounded-xl border bg-sf-primary p-3 lg:col-span-1"
      >
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-bold text-sf-text">用例列表</h2>
          <span class="text-sm text-sf-text-2">{{ evalCases.length }} 条</span>
        </div>
        <div class="space-y-3">
          <button
            v-for="item in evalCases"
            :key="item.id"
            class="w-full cursor-pointer rounded-lg border p-3 text-left transition hover:bg-sf-bg-2"
            :class="selectedId === item.id ? 'border-sf-theme bg-sf-bg-2' : 'border-sf-border'"
            type="button"
            @click="selectedId = item.id"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="truncate font-medium text-sf-text">{{ item.title }}</span>
              <span class="shrink-0 text-sm" :class="statusOf(item).class">
                {{ statusOf(item).text }}
              </span>
            </div>
            <div class="mt-3 flex items-center justify-between gap-3 text-sm text-sf-text-2">
              <span>{{ item.group }}</span>
              <span>{{ item.source }}</span>
            </div>
          </button>
        </div>
      </section>

      <section
        v-if="selectedCase"
        class="border-sf-border min-h-0 overflow-y-auto rounded-xl border bg-sf-primary p-3 lg:col-span-2"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="font-bold text-sf-text">{{ selectedCase.title }}</h2>
            <p class="mt-3 text-sm text-sf-text-2">{{ selectedCase.id }} · {{ selectedCase.prompt }}</p>
          </div>
          <span
            v-if="selectedResult"
            class="font-medium"
            :class="selectedResult.passed ? 'text-sf-success' : 'text-sf-error'"
          >
            {{ selectedResult.passed ? "通过" : "失败" }}
          </span>
          <span v-else class="text-sm text-sf-text-2">尚未运行</span>
        </div>

        <div v-if="selectedResult" class="border-sf-border mt-3 rounded-lg border p-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 class="font-bold text-sf-text">任务契约</h3>
            <span v-if="selectedResult.task?.implicit" class="text-sm text-sf-warning">降级建立</span>
          </div>
          <template v-if="selectedResult.task">
            <div class="mt-3 text-sm break-words text-sf-text-2">
              目标：{{ selectedResult.task.objective }}
            </div>
            <div class="mt-3 text-sm text-sf-text-2">
              必需效果：
              <span v-if="!selectedResult.task.requiredEffects.length" class="text-sf-warning">
                无（模型判定这轮只需文字回复）
              </span>
              <span v-else class="text-sf-text">{{ selectedResult.task.requiredEffects.join("、") }}</span>
            </div>
            <div class="mt-3 text-sm break-words text-sf-text-2">
              完成条件：{{ selectedResult.task.successCondition }}
            </div>
            <div v-if="selectedResult.task.capabilityIds.length" class="mt-3 text-sm text-sf-text-2">
              能力：{{ selectedResult.task.capabilityIds.join("、") }}
            </div>
          </template>
          <div v-else-if="isLegacyResult" class="mt-3 text-sm text-sf-text-2">
            旧记录没有保存任务契约，重新运行本用例可查看
          </div>
          <div v-else class="mt-3 text-sm text-sf-warning">本轮没有建立任务契约</div>
        </div>

        <div class="mt-3 space-y-3">
          <div
            v-for="(assertion, index) in assertionRows"
            :key="`${index}-${assertion.label}`"
            class="rounded-lg border p-3"
            :class="assertionClass(assertion.passed)"
          >
            <div class="flex items-start gap-3">
              <span class="shrink-0 text-sm" :class="assertionTextClass(assertion.passed)">
                {{ assertionText(assertion.passed) }}
              </span>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-sf-text">{{ assertion.label }}</div>
                <div v-if="assertion.detail" class="mt-3 text-sm break-words text-sf-error">
                  {{ assertion.detail }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedResult?.error" class="mt-3 rounded-lg border border-sf-warning p-3 text-sm text-sf-warning">
          {{ selectedResult.error }}
        </div>

        <div v-if="selectedResult?.changes.length" class="mt-3">
          <h3 class="font-bold text-sf-text">本轮实际写入</h3>
          <div class="mt-3 space-y-3">
            <div
              v-for="(change, index) in selectedResult.changes"
              :key="`${index}-${change}`"
              class="rounded-lg bg-sf-bg-2 p-3 text-sm text-sf-text-2"
            >
              {{ change }}
            </div>
          </div>
        </div>

        <div v-if="selectedResult?.diff?.length" class="mt-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 class="font-bold text-sf-text">改动对比（{{ selectedResult.diff.length }} 处）</h3>
            <button
              class="cursor-pointer rounded-lg border border-sf-border px-3 py-3 text-sm text-sf-text-2 transition hover:bg-sf-bg-2"
              type="button"
              @click="copyBlock('diff', diffText)"
            >
              {{ copyLabel("diff") }}
            </button>
          </div>
          <div class="mt-3 space-y-3">
            <div
              v-for="(item, index) in selectedResult.diff"
              :key="`${index}-${item.path}`"
              class="rounded-lg bg-sf-bg-2 p-3 text-sm"
            >
              <div class="font-medium break-words text-sf-text">{{ item.path }}</div>
              <div class="mt-3 break-words text-sf-error">− {{ item.before || "（空）" }}</div>
              <div class="mt-3 break-words text-sf-success">+ {{ item.after || "（空）" }}</div>
            </div>
          </div>
        </div>
        <div
          v-else-if="selectedResult && !selectedResult.error && !isLegacyResult"
          class="border-sf-border mt-3 rounded-lg border p-3 text-sm text-sf-text-2"
        >
          本轮没有产生字段改动
        </div>

        <div v-if="selectedResult?.steps.length" class="mt-3">
          <h3 class="font-bold text-sf-text">工具轨迹</h3>
          <div class="mt-3 space-y-3">
            <div
              v-for="step in selectedResult.steps"
              :key="`${step.sequence}-${step.tool}`"
              class="flex items-start justify-between gap-3 rounded-lg bg-sf-bg-2 p-3"
            >
              <div class="min-w-0">
                <div class="font-medium text-sf-text">
                  {{ TOOL_LABELS[step.tool] || step.tool }}
                </div>
                <div class="mt-3 text-sm break-words text-sf-text-2">{{ step.summary }}</div>
              </div>
              <span class="shrink-0 text-sm" :class="step.status === 'failed' ? 'text-sf-error' : 'text-sf-text-2'">
                {{ step.status }}
              </span>
            </div>
          </div>
        </div>

        <details v-if="selectedResult?.answer" class="border-sf-border mt-3 rounded-lg border p-3">
          <summary class="cursor-pointer font-medium text-sf-text">
            最终回答
            <span
              class="ml-3 cursor-pointer text-sm text-sf-text-2 hover:underline"
              @click.stop.prevent="copyBlock('answer', selectedResult.answer)"
            >
              {{ copyLabel("answer") }}
            </span>
          </summary>
          <pre class="mt-3 overflow-auto text-sm break-words whitespace-pre-wrap text-sf-text-2">{{ selectedResult.answer }}</pre>
        </details>

        <details
          v-if="selectedResult?.resumeAfter"
          class="border-sf-border mt-3 rounded-lg border p-3"
        >
          <summary class="cursor-pointer font-medium text-sf-text">
            写入后简历
            <span
              class="ml-3 cursor-pointer text-sm text-sf-text-2 hover:underline"
              @click.stop.prevent="copyBlock('after', resumeAfterText)"
            >
              {{ copyLabel("after") }}
            </span>
          </summary>
          <pre
            class="mt-3 max-h-96 overflow-auto text-sm break-words whitespace-pre-wrap text-sf-text-2"
            >{{ resumeAfterText }}</pre
          >
        </details>

        <details class="border-sf-border mt-3 rounded-lg border p-3">
          <summary class="cursor-pointer font-medium text-sf-text">
            用例输入
            <span
              class="ml-3 cursor-pointer text-sm text-sf-text-2 hover:underline"
              @click.stop.prevent="copyBlock('before', resumeBeforeText)"
            >
              {{ copyLabel("before") }}
            </span>
          </summary>
          <pre
            class="mt-3 max-h-96 overflow-auto text-sm break-words whitespace-pre-wrap text-sf-text-2"
            >{{ resumeBeforeText }}</pre
          >
        </details>
      </section>
    </div>
  </div>
</template>
