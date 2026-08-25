import { ERROR_CODES, processJson, StreamError } from "../request/stream-utils";

/**
 * OpenAI 兼容接口非流式解析逻辑
 * @param {Object} res - 原始响应
 * @returns {any} 原始响应对象
 */
export const openaiParser = (res: any) => {
  if (!res) {
    throw new StreamError("请求失败，返回数据为空", ERROR_CODES.NETWORK_ERROR);
  }
  return res;
};

/**
 * OpenAI Chat Completions 兼容接口流式解析逻辑
 * @param {string} line - SSE 数据行
 * @param {Object} options - 解析选项
 * @returns {Object|string} 当前增量内容
 */
export const openaiStreamParser = (line: string, { onEvent, debug }: any) => {
  const data = processJson(line, debug);
  if (!data || typeof data !== "object") return "";

  const delta = data.choices?.[0]?.delta || {};
  const content = typeof delta.content === "string" ? delta.content : "";
  const reasoning =
    typeof delta.reasoning_content === "string"
      ? delta.reasoning_content
      : typeof delta.reasoning === "string"
        ? delta.reasoning
        : "";
  const totalTokens = data.usage?.total_tokens;

  if (reasoning) onEvent?.("reasoning", reasoning);
  if (content) onEvent?.("content", content);
  if (typeof totalTokens === "number") onEvent?.("total_tokens", totalTokens);

  return {
    content,
    reasoning,
    total_tokens: totalTokens || 0,
  };
};
