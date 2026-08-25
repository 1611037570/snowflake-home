import { ark } from "@/configs";
import { LLM } from "./request/core";

const getApiKey = () => {
  return "c15973e5-8397-422f-9c86-a12df469d452";
};
const arkLLM = new LLM({
  baseUrl: ark.baseUrl,
  path: ark.path,
  getApiKey,
  provider: ark.provider,
});
export { arkLLM, LLM };
