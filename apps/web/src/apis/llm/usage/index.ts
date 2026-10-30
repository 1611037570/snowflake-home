import { computed, readonly, ref, shallowRef } from "vue";
import type { AiAgentKey } from "@/stores/modules/ai";
import { readAiUsageRecords, saveAiUsageRecord, type AiUsageRecord } from "./storage";
import { createAiTokenUsage, readAiTokenUsage, summarizeAiTokens, type AiTokenUsage } from "./tokens";

export type { AiUsageRecord } from "./storage";

const records = shallowRef<AiUsageRecord[]>([]);
const loading = ref(false);
const ready = ref(false);
const loadError = ref(false);
const saveError = ref(false);
interface ActiveAiUsage {
  record: Omit<AiUsageRecord, "status" | "endedAt" | "tokens">; // 本次完整调用的固定模型与时间信息。
  requests: AiTokenUsage[]; // 每次实际模型请求的最新用量，避免流式重复事件累加。
}
const active = new Map<string, ActiveAiUsage>();
const unsaved = new Map<string, AiUsageRecord>();
let loadingTask: Promise<void> | null = null;

// 加载与实时完成共用编号合并，异步读取不能覆盖刚产生的记录。
const mergeRecords = (saved: AiUsageRecord[]) => {
  records.value = [...new Map([...saved, ...records.value].map((record) => [record.id, record])).values()]
    .sort((left, right) => right.endedAt - left.endedAt);
};

const load = (): Promise<void> => {
  if (ready.value) return Promise.resolve();
  if (loadingTask) return loadingTask;
  loading.value = true;
  loadError.value = false;
  loadingTask = (async () => {
    try {
      mergeRecords(await readAiUsageRecords());
      ready.value = true;
    } catch { loadError.value = true; }
    finally { loading.value = false; loadingTask = null; }
  })();
  return loadingTask;
};

// 保存失败保留内存记录用于重试，不干扰 AI 正常返回或吞掉已完成的服务次数。
const persist = async (record: AiUsageRecord) => {
  try {
    await saveAiUsageRecord(record);
    unsaved.delete(record.id);
    if (!unsaved.size) saveError.value = false;
  } catch { saveError.value = true; }
};

export const startAiUsage = (id: string, agent: AiAgentKey, model = "") => {
  if (!id || active.has(id)) return;
  active.set(id, {
    record: {
      id, // 复用本次完整调用的编号，不为内部工具请求另计次数。
      agent, // 固定调用开始时的业务角色。
      model, // 固定实际调用的模型。
      startedAt: Date.now(), // 不等待存储即可开始模型调用。
    }, // 元信息不包含提示词或模型回答。
    requests: [], // 实际发出请求后才建立用量快照。
  });
};

// 网络请求开始时创建新快照，工具轮次与自动重试的消耗均单独累计。
export const startAiUsageRequest = (id: string) => { active.get(id)?.requests.push(createAiTokenUsage()); };

export const updateAiUsageTokens = (id: string, value: unknown) => {
  const request = active.get(id)?.requests.at(-1);
  if (!request) return;
  const usage = readAiTokenUsage(value);
  // 同一请求的总量事件和明细事件合并，缺失字段不覆盖已经收到的真实数值。
  for (const key of ["inputTokens", "outputTokens", "totalTokens", "cachedTokens"] as const) {
    if (usage[key] !== null) request[key] = usage[key];
  }
};

export const finishAiUsage = (id: string, status: AiUsageRecord["status"]) => {
  const started = active.get(id);
  if (!started) return;
  // 结束状态只结算一次，重复回调或工具轮次不能重复累计。
  active.delete(id);
  const record: AiUsageRecord = {
    ...started.record,
    status, // 最终状态，失败和停止也保存已知用量。
    endedAt: Date.now(), // 实际结束时间。
    tokens: summarizeAiTokens(started.requests), // 各实际请求的用量合计，与服务次数独立。
  };
  mergeRecords([record]);
  unsaved.set(id, record);
  void persist(record);
};

const retry = async () => {
  await Promise.all([load(), ...[...unsaved.values()].map(persist)]);
};

// 页面只读取个人记录；成功服务次数独立于调试日志的保留数量与清空操作。
export const useAiUsage = () => ({
  records: readonly(records), // 按结束时间倒序排列的个人记录。
  completedCount: computed(() => records.value.filter((record) => record.status === "success").length), // 已完成服务次数，不将失败或停止算作成果。
  totalTokens: computed(() => {
    if (!records.value.length) return 0;
    const provided = records.value.flatMap((record) => record.tokens?.totalTokens == null ? [] : [record.tokens.totalTokens]);
    return provided.length ? provided.reduce((total, value) => total + value, 0) : null;
  }), // 所有状态下已知的 Token 消耗，未返回用量不能当作零。
  tokenUsagePartial: computed(() => records.value.some((record) => record.tokens?.totalTokens == null || record.tokens.partial.includes("totalTokens"))), // 汇总包含未知用量时展示为已知消耗下限。
  loading: readonly(loading), // 是否正在读取历史记录。
  ready: readonly(ready), // 历史数据是否读取完成，未完成时不展示误导性的零值。
  loadError: readonly(loadError), // 读取失败时提供原地重试。
  saveError: readonly(saveError), // 写入失败时保留真实内存数据并允许重试。
  load, // 首次进入页面时读取记录。
  retry, // 重试读取与尚未保存的记录。
});
