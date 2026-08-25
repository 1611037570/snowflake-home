import { snowflake } from "@/configs";
import { LLM } from "./request/core";
import { useAiStore } from "@/stores";

const snowflakeConfig = {
  baseUrl: snowflake.baseUrl,
  path: snowflake.path,
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
  return new LLM(customModel.value);
};
export { getLLM, LLM };
