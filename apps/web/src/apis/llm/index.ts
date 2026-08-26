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
  const { activeModel, customModel } = storeToRefs(aiStore);
  if (activeModel.value === "snowflake") {
    return new LLM(snowflakeConfig);
  }
  const config = customModel.value || {};
  // 将设置页保存的字段转换为 LLM 构造函数契约
  return new LLM({
    baseUrl: config.url,
    getApiKey: () => config.key,
    provider: config.provider,
  });
};
export { getLLM, LLM };
