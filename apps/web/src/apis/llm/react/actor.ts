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
    // 打印原始参数，便于排查模型输出
    console.log(
      "[ReAct] 工具参数解析失败，原始内容:",
      toolCall.function.arguments,
    );
    // 容错：参数可能混入自然语言，尝试提取首尾大括号内的 JSON
    const raw = (toolCall.function.arguments || "").trim();
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        args = JSON.parse(raw.slice(start, end + 1));
      } catch {
        throw new Error(`工具参数解析失败: ${toolCall.function.name}`);
      }
    } else {
      throw new Error(`工具参数解析失败: ${toolCall.function.name}`);
    }
  }

  return tool.execute(args);
}
