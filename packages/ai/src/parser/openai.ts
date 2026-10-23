import { processJson, readTotalTokens } from "./stream.js";

/**
 * OpenAI 兼容接口非流式解析逻辑
 * @param {Object} res - 原始响应
 * @returns {any} 原始响应对象
 */
export const openaiParser = (res: any) => {
  if (!res) {
    throw new Error("请求失败，返回数据为空");
  }
  return res;
};

/**
 * OpenAI Chat Completions 兼容接口流式解析逻辑
 * @param {string} line - SSE 数据行
 * @param {Object} options - 解析选项
 * @returns {Object|string} 当前增量内容
 */
export const openaiStreamParser = (line: string, { onEvent, isDebug }: any) => {
  const data = processJson(line, isDebug);
  if (!data || typeof data !== "object") return "";

  const delta = data.choices?.[0]?.delta || {};
  const content = typeof delta.content === "string" ? delta.content : "";
  // 工具调用增量：模型在 ReAct 流程中输出 tool_calls 时，会按 index 分片返回
  const toolCalls = Array.isArray(delta.tool_calls) ? delta.tool_calls : [];
  const reasoning =
    typeof delta.reasoning_content === "string"
      ? delta.reasoning_content
      : typeof delta.reasoning === "string"
        ? delta.reasoning
        : "";
  // 兼容顶层用量事件及带 response 包装的完成事件。
  const usage = data.usage ?? data.response?.usage ?? (readTotalTokens(data) !== undefined ? data : undefined);
  const totalTokens = readTotalTokens(usage);

  if (reasoning) onEvent?.("reasoning", reasoning);
  if (content) onEvent?.("content", content);
  if (toolCalls.length) {
    toolCalls.forEach((tc: any) => onEvent?.("tool_call_delta", tc));
  }
  if (typeof totalTokens === "number") onEvent?.("total_tokens", totalTokens);
  if (usage && typeof usage === "object") onEvent?.("usage", usage);

  return {
    content,
    reasoning,
    total_tokens: totalTokens || 0,
  };
};
