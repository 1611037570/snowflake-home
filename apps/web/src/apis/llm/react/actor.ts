import type { ToolCall } from "./types";
import type { ToolRegistry } from "./tools";

// 部分模型会把参数中的空格/引号等编码成 HTML 实体，先解码再解析 JSON
function decodeHtmlEntities(value: string): string {
  if (!value) return value;
  let result = value;
  for (let round = 0; round < 2; round += 1) {
    result = result.replace(
      /&#(x[0-9a-f]+|\d+);|&(lt|gt|amp|quot|apos|nbsp);/gi,
      (match, numeric, named) => {
        if (numeric) {
          const code =
            numeric[0]?.toLowerCase() === "x"
              ? parseInt(numeric.slice(1), 16)
              : parseInt(numeric, 10);
          return Number.isFinite(code) ? String.fromCodePoint(code) : match;
        }
        const map: Record<string, string> = {
          lt: "<",
          gt: ">",
          amp: "&",
          quot: '"',
          apos: "'",
          nbsp: " ",
        };
        return map[named?.toLowerCase() ?? ""] ?? match;
      },
    );
  }
  return result;
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
    throw new Error(`未注册的工具: ${toolCall.function.name}`);
  }

  let args: any = {};
  const rawArguments = decodeHtmlEntities(toolCall.function.arguments || "");
  try {
    args = rawArguments ? JSON.parse(rawArguments) : {};
  } catch {
    // 打印原始参数，便于排查模型输出
    console.log(
      "[ReAct] 工具参数解析失败，原始内容:",
      rawArguments,
    );
    // 容错：参数可能混入自然语言，尝试提取首尾大括号内的 JSON
    const raw = rawArguments.trim();
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
