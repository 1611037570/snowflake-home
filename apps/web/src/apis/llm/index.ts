import { snowflake } from "@/configs";
import { LLM } from "./request/core";
import { useAiStore } from "@/stores";

const snowflakeConfig = {
  baseUrl: snowflake.baseUrl,
  getApiKey: () => {
    return "";
  },
  provider: snowflake.provider,
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
  // deepseek 走 OpenAI 兼容协议
  const llmProvider = config.provider === "deepseek" ? "openai" : config.provider;
  return new LLM({
    baseUrl: config.url,
    getApiKey: () => config.key,
    provider: llmProvider,
  });
};
export { getLLM, LLM };
