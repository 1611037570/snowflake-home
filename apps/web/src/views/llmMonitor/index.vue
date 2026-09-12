<script setup lang="ts">
import {
  clearLlmTraces,
  llmTraces,
  type LlmTrace,
  type LlmTraceEventType,
  type LlmTraceStatus,
} from "@/apis/llm/monitor";

const selectedId = ref("");

const statusText: Record<LlmTraceStatus, string> = {
  pending: "等待中",
  requesting: "请求中",
  streaming: "生成中",
  success: "已完成",
  error: "失败",
  aborted: "已取消",
  timeout: "已超时",
};

const statusClass: Record<LlmTraceStatus, string> = {
  pending: "text-sf-info",
  requesting: "text-sf-info",
  streaming: "text-sf-theme",
  success: "text-sf-success",
  error: "text-sf-error",
  aborted: "text-sf-warning",
  timeout: "text-sf-warning",
};

const eventText: Record<LlmTraceEventType, string> = {
  created: "已创建",
  request: "已发起请求",
  response: "已收到响应",
  first_token: "收到首字",
  retry: "准备重试",
  tool_call: "调用工具",
  tool_result: "工具返回结果",
  error: "发生错误",
  complete: "请求完成",
};

const selectedTrace = computed(() => {
  return llmTraces.value.find((trace) => trace.id === selectedId.value) || llmTraces.value[0];
});

function selectTrace(id: string) {
  selectedId.value = id;
}

function formatTime(value?: number) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatDuration(trace: LlmTrace) {
  const endTime =
    trace.endTime || trace.lastUpdateTime || trace.events.at(-1)?.time || trace.startTime;
  return `${((endTime - trace.startTime) / 1000).toFixed(2)} 秒`;
}

function formatFirstToken(trace: LlmTrace) {
  if (!trace.firstTokenTime) return "—";
  return `${trace.firstTokenTime - trace.startTime} 毫秒`;
}

function getToken(trace: LlmTrace, type: "input" | "output" | "total") {
  if (typeof trace.usage === "number") {
    return type === "total" ? trace.usage.toLocaleString() : "—";
  }
  if (!trace.usage || typeof trace.usage !== "object") return "—";
  const usage = trace.usage as Record<string, unknown>;
  const keys = {
    input: ["input_tokens", "prompt_tokens"],
    output: ["output_tokens", "completion_tokens"],
    total: ["total_tokens"],
  }[type];
  const value = keys.map((key) => usage[key]).find((item) => typeof item === "number");
  return typeof value === "number" ? value.toLocaleString() : "—";
}

function formatData(value: unknown) {
  if (value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function isToolEvent(type: LlmTraceEventType) {
  return type === "tool_call" || type === "tool_result";
}
</script>

<template>
  <SfViewContainer>
    <div class="flex h-full flex-col overflow-hidden p-3">
      <div class="mb-3 flex shrink-0 items-center justify-between gap-3">
        <div>
          <h1 class="text-lg font-bold text-sf-text">LLM 请求观测</h1>
          <p class="mt-3 text-sm text-sf-text-2">数据仅保存在当前浏览器，不参与模型请求。</p>
        </div>
        <button
          class="border-sf-border cursor-pointer rounded-lg border px-3 py-3 text-sm text-sf-text transition hover:bg-sf-bg-2"
          type="button"
          @click="clearLlmTraces"
        >
          清空记录
        </button>
      </div>

      <div class="grid min-h-0 flex-1 gap-3 lg:grid-cols-3">
        <section
          class="border-sf-border min-h-0 overflow-y-auto rounded-xl border bg-sf-primary p-3 lg:col-span-1"
        >
          <div class="mb-3 flex items-center justify-between">
            <h2 class="font-bold text-sf-text">请求列表</h2>
            <span class="text-sm text-sf-text-2">{{ llmTraces.length }} 条</span>
          </div>
          <div v-if="llmTraces.length" class="space-y-3">
            <button
              v-for="trace in llmTraces"
              :key="trace.id"
              class="w-full cursor-pointer rounded-lg border p-3 text-left transition hover:bg-sf-bg-2"
              :class="
                selectedTrace?.id === trace.id ? 'border-sf-theme bg-sf-bg-2' : 'border-sf-border'
              "
              type="button"
              @click="selectTrace(trace.id)"
            >
              <div class="flex items-center justify-between gap-3">
                <span class="truncate font-medium text-sf-text">{{
                  trace.model || trace.provider
                }}</span>
                <span class="shrink-0 text-sm" :class="statusClass[trace.status]">
                  {{ statusText[trace.status] }}
                </span>
              </div>
              <div class="mt-3 flex items-center justify-between gap-3 text-sm text-sf-text-2">
                <span>{{ formatTime(trace.startTime) }}</span>
                <span>{{ formatDuration(trace) }}</span>
              </div>
            </button>
          </div>
          <div v-else class="py-9 text-center text-sm text-sf-text-2">暂无请求记录</div>
        </section>

        <section
          v-if="selectedTrace"
          class="border-sf-border min-h-0 overflow-y-auto rounded-xl border bg-sf-primary p-3 lg:col-span-2"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="font-bold text-sf-text">
                {{ selectedTrace.model || selectedTrace.provider }}
              </h2>
              <p class="mt-3 text-sm text-sf-text-2">{{ selectedTrace.id }}</p>
            </div>
            <span class="font-medium" :class="statusClass[selectedTrace.status]">
              {{ statusText[selectedTrace.status] }}
            </span>
          </div>

          <div class="mt-3 grid gap-3 sm:grid-cols-3">
            <div class="rounded-lg bg-sf-bg-2 p-3">
              <div class="text-sm text-sf-text-2">总耗时</div>
              <div class="mt-3 font-medium text-sf-text">{{ formatDuration(selectedTrace) }}</div>
            </div>
            <div class="rounded-lg bg-sf-bg-2 p-3">
              <div class="text-sm text-sf-text-2">首字耗时</div>
              <div class="mt-3 font-medium text-sf-text">{{ formatFirstToken(selectedTrace) }}</div>
            </div>
            <div class="rounded-lg bg-sf-bg-2 p-3">
              <div class="text-sm text-sf-text-2">供应商</div>
              <div class="mt-3 font-medium text-sf-text">{{ selectedTrace.provider }}</div>
            </div>
            <div class="rounded-lg bg-sf-bg-2 p-3">
              <div class="text-sm text-sf-text-2">输入 Token</div>
              <div class="mt-3 font-medium text-sf-text">
                {{ getToken(selectedTrace, "input") }}
              </div>
            </div>
            <div class="rounded-lg bg-sf-bg-2 p-3">
              <div class="text-sm text-sf-text-2">输出 Token</div>
              <div class="mt-3 font-medium text-sf-text">
                {{ getToken(selectedTrace, "output") }}
              </div>
            </div>
            <div class="rounded-lg bg-sf-bg-2 p-3">
              <div class="text-sm text-sf-text-2">总 Token</div>
              <div class="mt-3 font-medium text-sf-text">
                {{ getToken(selectedTrace, "total") }}
              </div>
            </div>
          </div>

          <div class="mt-3 space-y-3">
            <details class="border-sf-border rounded-lg border p-3">
              <summary class="cursor-pointer font-medium text-sf-text">请求输入</summary>
              <pre
                class="mt-3 overflow-auto text-sm break-words whitespace-pre-wrap text-sf-text-2"
                >{{ formatData(selectedTrace.input) }}</pre
              >
            </details>
            <details v-if="selectedTrace.reasoning" class="border-sf-border rounded-lg border p-3">
              <summary class="cursor-pointer font-medium text-sf-text">思考内容</summary>
              <pre
                class="mt-3 overflow-auto text-sm break-words whitespace-pre-wrap text-sf-text-2"
                >{{ selectedTrace.reasoning }}</pre
              >
            </details>
            <details class="border-sf-border rounded-lg border p-3" open>
              <summary class="cursor-pointer font-medium text-sf-text">模型输出</summary>
              <pre
                class="mt-3 overflow-auto text-sm break-words whitespace-pre-wrap text-sf-text-2"
                >{{ selectedTrace.output || "等待模型输出" }}</pre
              >
            </details>
            <div
              v-if="selectedTrace.error"
              class="rounded-lg border border-sf-error p-3 text-sm text-sf-error"
            >
              {{ selectedTrace.error }}
            </div>
          </div>

          <div class="mt-3">
            <h3 class="font-bold text-sf-text">事件时间线</h3>
            <div class="mt-3 space-y-3">
              <template v-for="event in selectedTrace.events" :key="`${event.time}-${event.type}`">
                <details v-if="isToolEvent(event.type)" class="rounded-lg bg-sf-bg-2 p-3">
                  <summary class="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                    <span class="font-medium text-sf-text">{{ eventText[event.type] }}</span>
                    <span class="text-sm text-sf-text-2">{{ formatTime(event.time) }}</span>
                  </summary>
                  <pre
                    v-if="event.data !== undefined"
                    class="mt-3 overflow-auto text-sm break-words whitespace-pre-wrap text-sf-text-2"
                    >{{ formatData(event.data) }}</pre
                  >
                </details>
                <div v-else class="rounded-lg bg-sf-bg-2 p-3">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <span class="font-medium text-sf-text">{{ eventText[event.type] }}</span>
                    <span class="text-sm text-sf-text-2">{{ formatTime(event.time) }}</span>
                  </div>
                  <pre
                    v-if="event.data !== undefined"
                    class="mt-3 overflow-auto text-sm break-words whitespace-pre-wrap text-sf-text-2"
                    >{{ formatData(event.data) }}</pre
                  >
                </div>
              </template>
            </div>
          </div>
        </section>

        <section v-else class="border-sf-border rounded-xl border bg-sf-primary p-3 lg:col-span-2">
          <div class="py-9 text-center text-sm text-sf-text-2">选择一条请求记录查看详情</div>
        </section>
      </div>
    </div>
  </SfViewContainer>
</template>
