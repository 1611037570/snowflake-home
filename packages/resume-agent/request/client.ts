import { getResumeParseLLM, getXiaoYangLLM, getXiaoZhouLLM } from "@/apis/llm";
import type { LLM } from "@/apis/llm";
import { useAiStore } from "@/stores";
import type { ResumeAiAgent } from "./types";

// 按模型角色获取简历 AI 实例
export const getResumeAiModel = (agent: ResumeAiAgent): LLM | undefined => {
  if (agent === "xiaoYang") return getXiaoYangLLM();
  if (agent === "resumeParser") return getResumeParseLLM();
  return getXiaoZhouLLM();
};

// 角色模型是否已完整配置
export const hasResumeAiModel = (agent: ResumeAiAgent) => {
  const aiStore = useAiStore();
  const modelId = aiStore.getAgentModelId(agent);
  const model = aiStore.modelList.find((item) => item.id === modelId);
  return Boolean(model?.provider && model.key && model.url && model.model);
};
