import type { ReactConfig } from "@snowflake/ai";
import { getResumeAiModel } from "./client";
import { getResumeAiMessage } from "./messages";
import type { ResumeAiAgent } from "./types";

// 创建简历 AI 工具循环，请求模型的选择和实例化统一留在 AI 层。
export const createResumeAiReactRunner = (agent: ResumeAiAgent, config: ReactConfig) => {
  const llm = getResumeAiModel(agent);
  if (!llm?.apiKey || !llm.url || !llm.model) {
    throw new Error(getResumeAiMessage("modelUnset"));
  }
  return llm.react(config);
};
