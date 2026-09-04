import { snowflake } from "@/configs";
import { LLM } from "./request/core";
import { useAiStore } from "@/stores";

// ark、deepseek 与雪花服务均走 OpenAI Chat Completions 协议，统一映射为 openai 复用解析与请求格式
const mapProvider = (provider: string) =>
  ["deepseek", "ark", "snowflake"].includes(provider) ? "openai" : provider;

const snowflakeConfig = {
  url: snowflake.baseUrl,
  apiKey: snowflake.apiKey || "",
  provider: mapProvider(snowflake.provider),
  model: snowflake.model,
};

const getLLM = () => {
  const aiStore = useAiStore();
  const { activeModel, modelList } = storeToRefs(aiStore);

  // 查找已添加的模型配置（雪花服务添加后同样作为普通模型被找到）
  const config = modelList.value.find((model) => model.id === activeModel.value);

  // 未找到时回退内置雪花服务
  if (!config) {
    return new LLM(snowflakeConfig);
  }

  const llmProvider = mapProvider(config.provider);
  return new LLM({
    url: config.url,
    apiKey: config.key,
    provider: llmProvider,
    model: config.model,
  });
};

export { getLLM, LLM };
// 错误类型统一出口：供调用方区分主动中止与真实请求失败
export { ApiError, AbortError, isAbortError } from "./errors";
