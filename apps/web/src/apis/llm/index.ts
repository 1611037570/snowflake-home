import { snowflake } from "@/configs";
import { LLM } from "./request/core";
import { useAiStore } from "@/stores";

const getLLM = () => {
  const aiStore = useAiStore();
  const { activeModel, modelList } = storeToRefs(aiStore);

  // 查找已添加的模型配置（雪花服务添加后同样作为普通模型被找到）
  const config = modelList.value.find((model) => model.id === activeModel.value);

  // 未找到
  if (!config) {
    return;
  }

  return new LLM({
    url: config.url,
    apiKey: config.key,
    provider: config.provider,
    model: config.model,
  });
};

export { getLLM, LLM };
// 错误类型统一出口：供调用方区分主动中止与真实请求失败
export { ApiError, AbortError, isAbortError } from "./errors";
