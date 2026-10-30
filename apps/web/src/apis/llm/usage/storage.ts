import { createStore, set, values } from "idb-keyval";
import type { AiAgentKey } from "@/stores/modules/ai";
import type { AiTokenSummary } from "./tokens";

export interface AiUsageRecord {
  id: string; // 一次完整调用的稳定编号，工具轮次与重复结束共用该编号。
  agent: AiAgentKey; // 发起调用的简历助手、面试官或解析角色。
  model: string; // 本次实际使用的模型名称，不包含接口地址或密钥。
  status: "success" | "error" | "aborted" | "timeout"; // 调用最终状态，主动停止与失败分别保存。
  startedAt: number; // 调用开始时间。
  endedAt: number; // 调用结束时间，用于展示时间和耗时。
  tokens?: AiTokenSummary; // 服务商实际返回的 Token 用量，不提供时不伪造消耗。
}

export interface AiServiceOverview {
  serviceCount: number; // 简历首页的服务次数展示值，与个人使用记录无关。
}

// 存储适配集中在此，后续可替换为后端读取与幂等写入，不改变统计和页面逻辑。
const database = createStore("snowflake-ai-usage", "records");
export const readAiUsageRecords = () => values<AiUsageRecord>(database);
export const saveAiUsageRecord = (record: AiUsageRecord) => set(record.id, record, database);

// 首页仅使用固定展示数据，不读取个人记录、不采集或上报使用信息。
export const getAiServiceOverview = async (): Promise<AiServiceOverview> => ({
  serviceCount: 32867, // 首版固定展示值，接入后端时只替换此读取入口。
});
