import type { LLM } from "@snowflake/ai";
import type { ResumeAiAgent } from "./types";

// 宿主提供的模型选择能力，领域包不读取具体状态管理实现。
export interface ResumeAiModelProvider {
  // 按业务角色返回当前选中的模型实例。
  getModel: (agent: ResumeAiAgent) => LLM | undefined;
  // 判断业务角色对应的模型是否已完整配置。
  hasModel: (agent: ResumeAiAgent) => boolean;
}

let modelProvider: ResumeAiModelProvider | undefined;

// 注册当前宿主的模型选择能力，所有简历 AI 入口共用同一来源。
export const configureResumeAiModelProvider = (provider: ResumeAiModelProvider) => {
  modelProvider = provider;
};

// 按模型角色获取简历 AI 实例。
export const getResumeAiModel = (agent: ResumeAiAgent): LLM | undefined =>
  modelProvider?.getModel(agent);

// 角色模型是否已完整配置。
export const hasResumeAiModel = (agent: ResumeAiAgent) =>
  modelProvider?.hasModel(agent) ?? false;
