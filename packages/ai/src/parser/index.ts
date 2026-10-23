import { arkParser, arkStreamParser } from "./ark.js";
import { cozeWorkflowStreamParser } from "./cozeWorkflow.js";
import { openaiParser, openaiStreamParser } from "./openai.js";

// 流式解析器管理对象
export const streamParsers = {
  ark: arkStreamParser,
  cozeWorkflow: cozeWorkflowStreamParser,
  openai: openaiStreamParser,
};

// 非流式解析器管理对象
export const notStreamParsers = {
  ark: arkParser,
  openai: openaiParser,
};

/**
 * 获取解析器的工厂函数
 * @param {Object} params
 * @param {string} params.provider - 供应商名称
 * @param {string} params.protocol - 接口协议类型
 * @param {boolean} [params.isStream=true] - 是否为流式解析
 * @returns {Function} 解析器函数
 */
export const getParser = ({ provider = "ark", protocol, isStream = true }: {
  provider?: string;
  protocol?: "chatCompletions" | "responses";
  isStream?: boolean;
}) => {
  const parserGroup = isStream ? streamParsers : notStreamParsers;

  // 解析格式由接口协议决定，工作流使用自身的专用格式。
  const parserKey =
    provider === "cozeWorkflow"
      ? provider
      : protocol === "responses"
        ? "ark"
        : protocol === "chatCompletions"
          ? "openai"
          : provider === "ark"
            ? "ark"
            : "openai";
  const parser = (parserGroup as Record<string, any>)[parserKey];

  if (!parser) {
    throw new Error(`未找到供应商 ${provider} 的${isStream ? "流式" : "非流式"}解析器`);
  }

  return parser;
};

/**
 * 创建流式解析器：缓冲不完整的行，逐行交给协议解析器，汇总内容与 token
 */
export function createStreamParser({ onEvent, isDebug, provider, protocol }: any) {
  let buffer = "";

  // 解析器固定，仅查找一次
  const parser = getParser({ provider, protocol, isStream: true });
  const options = { onEvent, isDebug };

  // 根据接口协议选择解析函数
  const params = (line: string) => {
    if (!parser) {
      const msg = `未找到供应商 ${provider} 的解析器`;
      if (isDebug) console.warn(msg);
      throw new Error(msg);
    }

    return parser(line, options);
  };

  const parseChunk = (chunk: string, finish = false) => {
    let currentBatchContent = "";
    let currentBatchUsage = null;

    // 拼接新数据到缓冲区
    buffer += chunk;

    // 统一换行符并分割
    const normalizedBuffer = buffer.replace(/\r\n/g, "\n");
    const lines = normalizedBuffer.split("\n");

    // 普通分片保留未结束的行；传输结束时处理剩余内容。
    buffer = finish ? "" : lines.pop() || "";

    // 处理完整的行
    for (const line of lines) {
      // SSE 心跳、元数据和结束标记不是 JSON 数据事件。
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(":") || /^(event|id|retry):/i.test(trimmed) || /^data:\s*\[DONE\]$/i.test(trimmed)) continue;
      const res = params(trimmed);
      if (typeof res === "string") {
        currentBatchContent += res;
      } else if (res && typeof res === "object") {
        currentBatchContent += res.content || "";
        if (res.total_tokens) {
          currentBatchUsage = res.total_tokens;
        }
      }
    }

    return {
      content: currentBatchContent,
      usage: currentBatchUsage,
    };
  };

  return {
    // 追加网络分片并解析其中完整的数据行。
    push: (chunk: string) => parseChunk(chunk),
    // 流结束时解析解码器和行缓冲区的剩余内容。
    finish: (tail: string) => parseChunk(tail, true),
  };
}
