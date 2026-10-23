import { processJson, readTotalTokens } from "./stream.js";

/**
 * Ark 供应商非流式解析逻辑
 * @param {Object} res - 原始响应对象
 * @returns {any} 解析出的数据
 */
export const arkParser = (res: any) => {
  if (!res) {
    throw new Error("请求失败，返回数据为空");
  }
  return res;
};

export const arkStreamParser = (line: string, { onEvent, isDebug }: any) => {
  const data = processJson(line, isDebug);
  const { type, delta } = data;
  console.log("data:>> ", data);

  let currentOutputContent = ""; // 最终输出给用户的内容
  let currentReasoningContent = ""; // 模型推理过程内容
  let totalTokens = 0; // Token 消耗统计

  // 推理内容增量（response.reasoning_summary_text.delta）
  if (type === "response.reasoning_summary_text.delta" && delta) {
    currentReasoningContent = delta;
    onEvent?.("reasoning", currentReasoningContent);
  }
  // 输出内容增量（response.output_text.delta）
  if (type === "response.output_text.delta" && delta) {
    currentOutputContent = delta;
    onEvent?.("content", currentOutputContent);
  }

  // 工具调用声明（response.output_item.added）：调用项标识与函数名只在这里出现一次
  if (type === "response.output_item.added" && data.item?.type === "function_call") {
    onEvent?.("tool_call_delta", {
      item_id: data.item.id,
      id: data.item.call_id || data.item.id,
      name: data.item.name,
      arguments: data.item.arguments || "",
    });
  }
  // 工具参数增量（response.function_call_arguments.delta）：按调用项标识拼接
  if (type === "response.function_call_arguments.delta" && data.delta) {
    onEvent?.("tool_call_delta", {
      item_id: data.item_id,
      arguments: data.delta,
    });
  }
  // 工具调用完成（response.output_item.done）：补正回填时需要的 call_id，参数已由增量拼好
  if (type === "response.output_item.done" && data.item?.type === "function_call") {
    onEvent?.("tool_call_delta", {
      item_id: data.item.id,
      id: data.item.call_id,
    });
  }

  // 处理 Token 消耗 (response.completed)
  if (type === "response.completed" && data.response?.usage) {
    totalTokens = readTotalTokens(data.response.usage) ?? 0;
    if (totalTokens > 0) onEvent?.("total_tokens", totalTokens);
    onEvent?.("usage", data.response.usage);
  }

  // 6. 调试日志
  if (isDebug) {
    currentReasoningContent && console.log("🔍 当前推理增量:", currentReasoningContent);
    currentOutputContent && console.log("💬 当前输出增量:", currentOutputContent);
    totalTokens && console.log("📊 Token 消耗:", totalTokens);
  }

  // 7. 返回增量内容和统计
  return {
    content: currentOutputContent,
    reasoning: currentReasoningContent,
    total_tokens: totalTokens,
  };
};
