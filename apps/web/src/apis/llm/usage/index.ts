import { readonly, ref, shallowRef } from "vue";
import type { AiAgentKey } from "@/stores/modules/ai";
import {
  AI_USAGE_AGENTS,
  clearLegacyAiUsage,
  createAiUsageStats,
  readAiUsageStats,
  saveAiUsageStats,
  type AiModelUsage,
  type AiUsageStats,
  type AiUsageStatus,
} from "./storage";
import { createAiTokenUsage, readAiTokenUsage, resolveAiTokenTotal, type AiTokenUsage } from "./tokens";

export type { AiModelUsage, AiUsageStat, AiUsageStats, AiUsageStatus } from "./storage";
export { AI_USAGE_AGENTS } from "./storage";

const stats = shallowRef<AiUsageStats>(createAiUsageStats());
const loading = ref(false);
const ready = ref(false);
const loadError = ref(false);
const saveError = ref(false);

interface ActiveAiUsage {
  agent: AiAgentKey; // 发起调用的业务角色
  model: string; // 本次实际使用的模型 ID
  current: AiTokenUsage; // 当前请求的用量，重复事件覆盖而不累加
  settled: number; // 已结算请求的用量合计
}
// 一次调用的进行中状态，工具轮次与重试共用编号，结束时只结算一次。
const active = new Map<string, ActiveAiUsage>();
let loadingTask: Promise<void> | null = null;
// 写入串行化，避免先发起的旧快照覆盖后发起的新值。
let saving: Promise<void> = Promise.resolve();

const load = (): Promise<void> => {
  if (ready.value) return Promise.resolve();
  if (loadingTask) return loadingTask;
  loading.value = true;
  loadError.value = false;
  loadingTask = (async () => {
    // 旧结构的数据不再读取，进入页面时清掉，清理失败不影响当前统计。
    try { await clearLegacyAiUsage(); } catch { /* 遗留数据清理失败不阻断统计 */ }
    try {
      stats.value = await readAiUsageStats();
      ready.value = true;
    } catch { loadError.value = true; }
    finally { loading.value = false; loadingTask = null; }
  })();
  return loadingTask;
};

const persist = () => {
  saving = saving.then(async () => {
    try {
      await saveAiUsageStats(stats.value); // 每次写入当前累计值，整份覆盖等于幂等
      saveError.value = false;
    } catch { saveError.value = true; }
  });
  return saving;
};

export const startAiUsage = (id: string, agent: AiAgentKey, model = "") => {
  if (!id || active.has(id)) return;
  active.set(id, { agent, model, current: createAiTokenUsage(), settled: 0 });
};

// 新请求开始前结算上一份用量，流式重复事件不会被累计。
export const startAiUsageRequest = (id: string) => {
  const usage = active.get(id);
  if (!usage) return;
  usage.settled += resolveAiTokenTotal(usage.current);
  usage.current = createAiTokenUsage();
};

export const updateAiUsageTokens = (id: string, value: unknown) => {
  const usage = active.get(id);
  if (!usage) return;
  const incoming = readAiTokenUsage(value);
  // 同一请求的总量与明细先后到达，缺失字段不覆盖已经收到的真实数值。
  for (const key of Object.keys(incoming) as (keyof AiTokenUsage)[]) {
    if (incoming[key] !== null) usage.current[key] = incoming[key];
  }
};

export const finishAiUsage = (id: string, status: AiUsageStatus) => {
  const usage = active.get(id);
  if (!usage) return;
  active.delete(id); // 结束只结算一次，重复回调不重复累加
  const tokens = usage.settled + resolveAiTokenTotal(usage.current);
  const succeeded = status === "success" ? 1 : 0;
  const modelKey = usage.model || "unknown"; // 模型缺失时归到同一占位项，避免出现空键
  const previous = stats.value[usage.agent];
  const model = previous.models[modelKey] ?? { count: 0, totalTokens: 0 };
  stats.value = {
    ...stats.value,
    [usage.agent]: {
      count: previous.count + succeeded,
      failed: previous.failed + (succeeded ? 0 : 1),
      totalTokens: previous.totalTokens + tokens,
      updatedAt: Date.now(),
      models: {
        ...previous.models,
        [modelKey]: { count: model.count + succeeded, totalTokens: model.totalTokens + tokens },
      },
    },
  };
  void persist();
};

const retry = async () => {
  await load();
  await persist();
};

// 清理已经不在模型配置里的统计项，失效模型的用量同时从角色合计里扣除。
export const pruneAiUsageModels = (validModels: string[]) => {
  const valid = new Set(validModels);
  const next = { ...stats.value };
  let removed = 0;
  for (const agent of AI_USAGE_AGENTS) {
    const stat = next[agent];
    const stale = Object.entries(stat.models).filter(([model]) => !valid.has(model));
    if (!stale.length) continue;
    removed += stale.length;
    const droppedCount = stale.reduce((sum, [, usage]) => sum + usage.count, 0);
    const droppedTokens = stale.reduce((sum, [, usage]) => sum + usage.totalTokens, 0);
    next[agent] = {
      ...stat,
      count: Math.max(0, stat.count - droppedCount), // 兜底防止历史数据不一致时扣成负数
      totalTokens: Math.max(0, stat.totalTokens - droppedTokens),
      models: Object.fromEntries(Object.entries(stat.models).filter(([model]) => valid.has(model))) as Record<string, AiModelUsage>,
    };
  }
  if (!removed) return 0;
  stats.value = next;
  void persist();
  return removed;
};

export const useAiUsage = () => ({
  stats: readonly(stats), // 三个角色的累计数据
  loading: readonly(loading), // 是否正在读取历史累计值
  ready: readonly(ready), // 读取完成前不展示误导性的零值
  loadError: readonly(loadError), // 读取失败时提供原地重试
  saveError: readonly(saveError), // 写入失败时保留内存累计值并允许重试
  load, // 首次进入页面时读取累计值
  retry, // 重试读取与写入
});
