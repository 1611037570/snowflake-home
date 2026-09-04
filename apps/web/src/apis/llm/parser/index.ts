import { arkParser, arkStreamParser } from "./ark";
import { cozeWorkflowStreamParser } from "./cozeWorkflow";
import { openaiParser, openaiStreamParser } from "./openai";

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
 * @param {boolean} [params.isStream=true] - 是否为流式解析
 * @returns {Function} 解析器函数
 */
export const getParser = ({ provider = "ark", isStream = true }) => {
  const parserGroup = isStream ? streamParsers : notStreamParsers;

  const parser = (parserGroup as Record<string, any>)[provider];

  if (!parser) {
    throw new Error(`未找到供应商 ${provider} 的${isStream ? "流式" : "非流式"}解析器`);
  }

  return parser;
};

/**
 * 创建流式解析器：缓冲不完整的行，逐行交给 provider 解析器，汇总内容与 token
 */
export function createStreamParser({ onEvent, isDebug, provider }: any) {
  let buffer = "";

  // 解析器固定，仅查找一次
  const parser = getParser({ provider, isStream: true });
  const options = { onEvent, isDebug };

  // 根据 provider 选择解析函数
  const params = (line: string) => {
    if (!parser) {
      const msg = `未找到供应商 ${provider} 的解析器`;
      if (isDebug) console.warn(msg);
      throw new Error(msg);
    }

    return parser(line, options);
  };

  return function (chunk: string) {
    let currentBatchContent = "";
    let currentBatchUsage = null;

    // 拼接新数据到缓冲区
    buffer += chunk;

    // 统一换行符并分割
    const normalizedBuffer = buffer.replace(/\r\n/g, "\n");
    const lines = normalizedBuffer.split("\n");

    // 保留最后一部分（可能是不完整的行）到下一次处理
    buffer = lines.pop() || "";

    // 处理完整的行
    for (const line of lines) {
      const res = params(line);
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
}
