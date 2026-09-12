import { getUUID } from "@/utils";
import { get, set } from "idb-keyval";
import { ref, toRaw } from "vue";

const TRACE_STORAGE_KEY = "llm-trace-list";
const TRACE_LIMIT = 50;
const INPUT_LIMIT = 12000;
const OUTPUT_LIMIT = 20000;

export type LlmTraceStatus =
  | "pending"
  | "requesting"
  | "streaming"
  | "success"
  | "error"
  | "aborted"
  | "timeout";

export type LlmTraceEventType =
  | "created"
  | "request"
  | "response"
  | "first_token"
  | "retry"
  | "tool_call"
  | "tool_result"
  | "error"
  | "complete";

export interface LlmTraceEvent {
  time: number;
  type: LlmTraceEventType;
  data?: unknown;
}

export interface LlmTrace {
  id: string;
  status: LlmTraceStatus;
  provider: string;
  model?: string;
  input: unknown;
  output: string;
  reasoning: string;
  usage?: unknown;
  error?: string;
  startTime: number;
  lastUpdateTime: number;
  endTime?: number;
  firstTokenTime?: number;
  events: LlmTraceEvent[];
}

interface CreateTraceOptions {
  provider: string;
  model?: string;
  input: unknown;
}

export const llmTraces = ref<LlmTrace[]>([]);

let persistTimer: ReturnType<typeof setTimeout> | null = null;

// Load saved traces without replacing traces created before IndexedDB is ready.
void get<LlmTrace[]>(TRACE_STORAGE_KEY)
  .then((savedTraces) => {
    if (!Array.isArray(savedTraces)) return;
    const currentIds = new Set(llmTraces.value.map((trace) => trace.id));
    llmTraces.value = [
      ...llmTraces.value,
      ...savedTraces.filter((trace) => !currentIds.has(trace.id)),
    ]
      .sort((left, right) => right.startTime - left.startTime)
      .slice(0, TRACE_LIMIT);
  })
  .catch(() => {});

function truncate(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit)}…` : value;
}

function formatContent(value: unknown) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    try {
      return String(value);
    } catch {
      return "[内容无法序列化]";
    }
  }
}

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[内容层级过深]";
  if (typeof value === "string") return truncate(value, INPUT_LIMIT);
  if (typeof value === "function") return "[函数已省略]";
  if (typeof value === "bigint") return String(value);
  if (Array.isArray(value)) return value.map((item) => sanitize(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.entries(value).reduce<Record<string, unknown>>((result, [key, item]) => {
      result[key] =
        /api[-_]?key|authorization|password|secret|access_token|refresh_token|id_token/i.test(key)
          ? "[已脱敏]"
          : sanitize(item, depth + 1);
      return result;
    }, {});
  }
  return value;
}

function schedulePersist() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      const traces = JSON.parse(JSON.stringify(toRaw(llmTraces.value))) as LlmTrace[];
      void set(TRACE_STORAGE_KEY, traces).catch(() => {});
    } catch {
      // Persistence failures must never affect the request flow.
    }
  }, 600);
}

function findTrace(id: string) {
  return llmTraces.value.find((trace) => trace.id === id);
}

function updateTrace(id: string, updater: (trace: LlmTrace) => void, shouldPersist = true) {
  try {
    const trace = findTrace(id);
    if (!trace) return;
    updater(trace);
    trace.lastUpdateTime = Date.now();
    if (shouldPersist) schedulePersist();
  } catch {
    // Observation failures must never affect the request flow.
  }
}

export function createLlmTrace(options: CreateTraceOptions) {
  try {
    const startTime = Date.now();
    const trace: LlmTrace = {
      id: getUUID(),
      status: "pending",
      provider: options.provider,
      model: options.model,
      input: sanitize(options.input),
      output: "",
      reasoning: "",
      startTime,
      lastUpdateTime: startTime,
      events: [{ time: startTime, type: "created" }],
    };
    llmTraces.value.unshift(trace);
    llmTraces.value.splice(TRACE_LIMIT);
    schedulePersist();
    return trace.id;
  } catch {
    return "";
  }
}

export function updateLlmTraceStatus(id: string, status: LlmTraceStatus) {
  updateTrace(id, (trace) => {
    trace.status = status;
  });
}

export function recordLlmTraceEvent(id: string, type: LlmTraceEventType, data?: unknown) {
  updateTrace(id, (trace) => {
    trace.events.push({ time: Date.now(), type, data: sanitize(data) });
  });
}

export function markLlmTraceFirstToken(id: string) {
  updateTrace(id, (trace) => {
    if (trace.firstTokenTime) return;
    trace.firstTokenTime = Date.now();
    trace.status = "streaming";
    trace.events.push({ time: trace.firstTokenTime, type: "first_token" });
  });
}

export function appendLlmTraceReasoning(id: string, content: unknown) {
  updateTrace(
    id,
    (trace) => {
      trace.reasoning = truncate(`${trace.reasoning}${String(content ?? "")}`, OUTPUT_LIMIT);
    },
    false,
  );
}

export function appendLlmTraceOutput(id: string, content: unknown) {
  updateTrace(
    id,
    (trace) => {
      trace.output = truncate(`${trace.output}${String(content ?? "")}`, OUTPUT_LIMIT);
    },
    false,
  );
}

export function setLlmTraceOutput(id: string, content: unknown) {
  updateTrace(
    id,
    (trace) => {
      trace.output = truncate(formatContent(content), OUTPUT_LIMIT);
    },
    false,
  );
}

export function updateLlmTraceUsage(id: string, usage: unknown) {
  updateTrace(
    id,
    (trace) => {
      trace.usage = sanitize(usage);
    },
    false,
  );
}

export function finishLlmTrace(
  id: string,
  status: Extract<LlmTraceStatus, "success" | "error" | "aborted" | "timeout">,
  error?: unknown,
) {
  updateTrace(id, (trace) => {
    trace.status = status;
    trace.endTime = Date.now();
    if (error) trace.error = truncate(String(error), INPUT_LIMIT);
    trace.events.push({
      time: trace.endTime,
      type: status === "success" ? "complete" : "error",
      ...(error ? { data: sanitize(String(error)) } : {}),
    });
  });
}

export function clearLlmTraces() {
  llmTraces.value = [];
  schedulePersist();
}
