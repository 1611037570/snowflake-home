import type { ReactConfig } from "@/apis/llm/react";
import { getResumeAiModel } from "./client";
import type { ResumeAiAgent } from "./types";

// 创建简历 AI 工具循环，请求模型的选择和实例化统一留在 AI 层。
export const createResumeAiReactRunner = (agent: ResumeAiAgent, config: ReactConfig) => {
  const llm = getResumeAiModel(agent);
  if (!llm?.apiKey || !llm.url || !llm.model) {
    throw new Error("请先配置并选择 AI 模型");
  }
  return llm.react(config);
};
