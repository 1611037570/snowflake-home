import type { ToolCall } from "./types";
import type { ToolRegistry } from "./tools";

/**
 * 执行一次工具调用，返回原始结果
 */
export async function executeToolCall(
  registry: ToolRegistry,
  toolCall: ToolCall,
): Promise<unknown> {
  const tool = registry.get(toolCall.function.name);
  if (!tool) {
    throw new Error(`未注册的工具: ${toolCall.function.name}`);
  }

  let args: any = {};
  try {
    args = toolCall.function.arguments
      ? JSON.parse(toolCall.function.arguments)
      : {};
  } catch {
    throw new Error(`工具参数解析失败: ${toolCall.function.name}`);
  }

  return tool.execute(args);
}
