import type { Observation, ToolCall } from "./types";

/**
 * 把工具执行结果格式化为模型可读的观察文本
 */
export function observe(toolCall: ToolCall, result: unknown): Observation {
  let content: string;
  try {
    content = JSON.stringify(result);
  } catch {
    content = String(result);
  }

  return {
    toolCallId: toolCall.id,
    content,
  };
}
