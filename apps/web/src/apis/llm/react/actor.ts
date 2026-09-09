import type { ToolCall } from "./types";
import type { ToolRegistry } from "./tools";
import { ToolNotFoundError } from "../errors";

// 将工具参数解析失败转换为可重试的工具观察结果
function createToolArgumentFailure(toolName: string, error: unknown) {
  const message = error instanceof SyntaxError ? error.message : "未知 JSON 语法错误";
  return {
    __tool_error: true,
    type: "invalid_tool_arguments",
    tool: toolName,
    message: `工具参数不是合法 JSON：${message}`,
    retryable: true,
    instruction:
      "请立即重新调用同一工具，只发送符合 parameters 定义的标准 JSON 对象；不要输出 Markdown 代码块、自然语言或非法反斜杠转义。",
  };
}

/**
 * 执行一次工具调用，返回原始结果
 */
export async function executeToolCall(
  registry: ToolRegistry,
  toolCall: ToolCall,
): Promise<unknown> {
  const tool = registry.get(toolCall.function.name);
  if (!tool) {
    throw new ToolNotFoundError(toolCall.function.name);
  }

  let args: any = {};
  try {
    args = toolCall.function.arguments
      ? JSON.parse(toolCall.function.arguments)
      : {};
  } catch (error) {
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
      } catch (fallbackError) {
        return createToolArgumentFailure(toolCall.function.name, fallbackError);
      }
    } else {
      return createToolArgumentFailure(toolCall.function.name, error);
    }
  }

  return tool.execute(args);
}
