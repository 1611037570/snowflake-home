import { snowflake } from "@/configs";
import { LLM } from "./request/core";
import { useAiStore } from "@/stores";

// ark 与 deepseek 均走 OpenAI Chat Completions 协议，统一映射为 openai 复用解析与请求格式
const mapProvider = (provider: string) =>
  ["deepseek", "ark"].includes(provider) ? "openai" : provider;

const snowflakeConfig = {
  url: snowflake.baseUrl,
  apiKey: snowflake.apiKey || "",
  provider: mapProvider(snowflake.provider),
  model: snowflake.model,
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
    url: config.url,
    apiKey: config.key,
    provider: llmProvider,
    model: config.model,
  });
};
export { getLLM, LLM };
