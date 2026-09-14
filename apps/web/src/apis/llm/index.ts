import { snowflake } from "@/configs";
import { LLM } from "./request/core";
import { useAiStore } from "@/stores";
import type { AiAgentKey } from "@/stores/modules/ai";

// 根据业务角色获取对应的模型实例
const getAgentLLM = (agent: AiAgentKey) => {
  const aiStore = useAiStore();
  const modelId = aiStore.getAgentModelId(agent);
  const config = aiStore.modelList.find((model) => model.id === modelId);

  if (!config) {
    return;
  }

  return new LLM({
    url: config.url,
    apiKey: config.key,
    provider: config.provider,
    model: config.model,
    protocol: config.protocol === "responses" ? "responses" : "chatCompletions",
  });
};

// 小舟用于普通 AI 对话
const getXiaoZhouLLM = () => getAgentLLM("xiaoZhou");

// 小羊用于简历助手及相关交互
const getXiaoYangLLM = () => getAgentLLM("xiaoYang");

// 简历解析模型供后续解析流程调用
const getResumeParseLLM = () => getAgentLLM("resumeParser");

export { getResumeParseLLM, getXiaoYangLLM, getXiaoZhouLLM, LLM };
// 错误类型统一出口：供调用方区分主动中止与真实请求失败
export { ApiError, AbortError, ToolNotFoundError, isAbortError } from "./errors";
