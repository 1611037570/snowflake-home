import { createStore, get, set } from "idb-keyval";
import type { AiAgentKey } from "@/stores/modules/ai";

// 一次调用的最终状态，失败与主动停止分别计入失败次数。
export type AiUsageStatus = "success" | "error" | "aborted" | "timeout";

// 参与统计的角色，顺序即页面展示顺序。
export const AI_USAGE_AGENTS: AiAgentKey[] = ["xiaoZhou", "xiaoYang", "resumeParser"];

export interface AiModelUsage {
  count: number; // 该模型成功完成的调用次数
  totalTokens: number; // 该模型累计 Token
}

export interface AiUsageStat {
  count: number; // 成功完成的调用次数
  failed: number; // 失败、超时与主动停止的次数
  totalTokens: number; // 累计 Token，服务商未返回时不计入
  updatedAt: number; // 最近一次调用的结束时间
  models: Record<string, AiModelUsage>; // 按模型 ID 累计的用量
}

// 三个角色各一份累计数据，键就是角色，页面可直接按角色取用。
export type AiUsageStats = Record<AiAgentKey, AiUsageStat>;

export interface AiServiceOverview {
  serviceCount: number; // 简历首页的服务次数展示值，与个人使用记录无关
}

const createAiUsageStat = (): AiUsageStat => ({
  count: 0,
  failed: 0,
  totalTokens: 0,
  updatedAt: 0,
  models: {},
});

export const createAiUsageStats = (): AiUsageStats => ({
  xiaoZhou: createAiUsageStat(),
  xiaoYang: createAiUsageStat(),
  resumeParser: createAiUsageStat(),
});

const database = createStore("snowflake-ai-stats", "stats");
const STATS_KEY = "current";

export const readAiUsageStats = async (): Promise<AiUsageStats> => {
  const saved = await get<Partial<AiUsageStats>>(STATS_KEY, database);
  const stats = createAiUsageStats();
  // 存储里缺角色或缺字段时按空值补齐，页面不必再判断 undefined。
  for (const agent of AI_USAGE_AGENTS) {
    const stat = saved?.[agent];
    if (stat) stats[agent] = { ...stats[agent], ...stat, models: stat.models ?? {} };
  }
  return stats;
};

export const saveAiUsageStats = (stats: AiUsageStats) => set(STATS_KEY, stats, database);

// 旧版统计用的库整体废弃，读取前删掉，避免残留 objectStore 让新库读不到数据。
export const clearLegacyAiUsage = () => new Promise<void>((resolve) => {
  const request = indexedDB.deleteDatabase("snowflake-ai-usage");
  request.onsuccess = () => resolve(); // 库不存在时同样按完成处理
  request.onerror = () => resolve(); // 删除失败不影响当前统计
  request.onblocked = () => resolve(); // 其他标签页占用时不阻塞页面加载
});

// 首页仅使用固定展示数据，不读取个人记录、不采集或上报使用信息。
export const getAiServiceOverview = async (): Promise<AiServiceOverview> => ({
  serviceCount: 32867, // 首版固定展示值，接入后端时只替换此读取入口。
});
