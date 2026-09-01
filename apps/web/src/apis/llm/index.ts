import { snowflake } from "@/configs";
import { LLM } from "./request/core";
import { useAiStore } from "@/stores";

// ark 与 deepseek 均走 OpenAI Chat Completions 协议，统一映射为 openai 复用解析与请求格式
const mapProvider = (provider: string) =>
  ["deepseek", "ark"].includes(provider) ? "openai" : provider;

const snowflakeConfig = {
  baseUrl: snowflake.baseUrl,
  getApiKey: snowflake.getApiKey || "",
  provider: mapProvider(snowflake.provider),
};
// 获取当前激活模型名：雪花服务取 snowflake.model，自定义模型取配置中的 model
const getActiveModel = () => {
  const aiStore = useAiStore();
  const { activeModel, customModels } = storeToRefs(aiStore);
  if (activeModel.value === "snowflake") return snowflake.model;
  const config = customModels.value.find((item) => item.provider === activeModel.value);
  return config?.model;
};
const getLLM = () => {
  const aiStore = useAiStore();
  const { activeModel, customModels } = storeToRefs(aiStore);
  if (activeModel.value === "snowflake") {
    return new LLM(snowflakeConfig);
  }
  // 按平台类型查找激活配置，未找到时回退雪花服务
  const config = customModels.value.find((item) => item.provider === activeModel.value);
  if (!config) {
    return new LLM(snowflakeConfig);
  }
  // deepseek 与 ark 走 OpenAI 兼容协议
  const llmProvider = mapProvider(config.provider);
  return new LLM({
    baseUrl: config.url,
    getApiKey: config.key,
    provider: llmProvider,
  });
};
export { getActiveModel, getLLM, LLM };
