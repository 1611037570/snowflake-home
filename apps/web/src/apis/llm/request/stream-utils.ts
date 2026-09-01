import { getParser } from "../parser/index";

// 定义自定义错误类
export class StreamError extends Error {
  code: number;
  name: string;
  constructor(message: string, code = -1) {
    super(message);
    this.code = code;
    this.name = "StreamError";
  }
}

export function processJson(jsonStr: string, isDebug: boolean) {
  // 入参终极防护：处理 null/undefined/非字符串，统一转为安全字符串
  let rawStr = String(jsonStr ?? "");
  // 统一清洗：移除 data: 前缀 + 去除首尾空格
  rawStr = rawStr.replace(/^data:/i, "").trim();
  // 检查是否为空字符串
  if (!rawStr) return "";

  // 校验标准JSON对象格式（必须{}包裹）
  if (!rawStr.startsWith("{") || !rawStr.endsWith("}")) {
    isDebug && console.warn("非标准JSON对象格式：", rawStr);
    return "";
  }
  try {
    return JSON.parse(rawStr);
  } catch (error) {
    if (isDebug) console.warn(`解析失败: ${rawStr}`, error);
    throw new Error("解析失败！");
  }
}
// 错误码常量
export const ERROR_CODES = {
  NETWORK_ERROR: 0, // 网络/请求级错误
  BUSINESS_ERROR: -1, // 业务逻辑/参数错误
};

export function processOption({ options }: any) {
  const data = JSON.stringify({
    ...options,
    stream: true, // 强制开启流式响应
  });

  return data;
}

// 处理token
export function processToken(token: string) {
  return `Bearer ${token}`;
}

// 创建流式解析器
export function createStreamParser({ onEvent, isDebug, provider }: any) {
  let buffer = "";
  console.log("provider", provider);

  // 根据 provider 选择解析函数
  const params = (line: string) => {
    const options = { onEvent, isDebug };
    const parser = getParser({ provider, isStream: true });

    if (!parser) {
      const msg = `未找到供应商 ${provider} 的解析器`;
      if (isDebug) console.warn(msg);
      throw new StreamError(msg, ERROR_CODES.BUSINESS_ERROR);
    }

    return parser(line, options);
  };

  return function (chunk: string) {
    let currentBatchContent = "";
    let currentBatchUsage = null;

    // 1. 拼接新数据到缓冲区
    buffer += chunk;

    // 2. 统一换行符并分割
    const normalizedBuffer = buffer.replace(/\r\n/g, "\n");
    const lines = normalizedBuffer.split("\n");

    // 3. 关键：保留最后一部分（可能是不完整的行）到下一次处理
    buffer = lines.pop() || "";

    // 4. 处理完整的行
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

// 处理最终结果
function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    // 仅当第一次失败时尝试补全
    try {
      const newStr = str + "}";
      console.log("原始内容:", str);
      console.log("尝试补全 JSON 字符串:", newStr);
      return JSON.parse(newStr);
    } catch {
      throw new Error(`JSON 解析失败，原始内容: ${str}`);
    }
  }
}
export function processResult({ text, isJson = true, isDebug }: any) {
  // 1. 输入校验（立即抛出）
  if (typeof text !== "string" || !text.length) {
    throw new StreamError("最终结果为空，无法解析", ERROR_CODES.NETWORK_ERROR);
  }

  const trimmed = text.trim();
  let result = trimmed;

  // 2. JSON 解析（独立 try-catch）
  if (isJson) {
    try {
      result = safeJsonParse(trimmed);
    } catch (err: any) {
      throw new StreamError(
        `最终结果解析失败: ${err.message}，原始内容: ${trimmed}`,
        ERROR_CODES.BUSINESS_ERROR,
      );
    }
  }

  // 3. 调试输出与返回
  if (isDebug) {
    console.log("流式传输完成，最终结果:", result);
  }
  return result;
}

// 处理错误信息
export function processError(e: any) {
  let error = e;

  if (e instanceof StreamError) {
    return { code: e.code, message: e.message };
  }

  if (typeof e === "string") {
    try {
      error = JSON.parse(e);
    } catch (err) {
      error = { code: -1, message: e };
    }
  } else if (e instanceof Error) {
    try {
      // 尝试解析 message 里的 JSON (兼容旧代码)
      const parsed = JSON.parse(e.message);
      if (parsed && typeof parsed === "object" && "message" in parsed) {
        error = parsed;
      } else {
        error = { code: -1, message: e.message };
      }
    } catch (err) {
      error = { code: -1, message: e.message };
    }
  }

  return error;
}

/**
 * 处理重试逻辑
 * @param {Object} params
 * @param {number} params.currentRetryCount 当前重试次数
 * @param {number} params.retryCount 最大重试次数
 * @param {boolean} params.isDebug 是否开启调试模式
 * @param {Function} params.onRetry 重试回调函数
 * @returns {Promise<{retried: boolean, result?: any}>}
 */
export async function handleRetry({ currentRetryCount, retryCount, isDebug, onRetry }: any) {
  // 重试次数未超过最大重试次数
  if (currentRetryCount < retryCount) {
    const delay = 500 * (currentRetryCount + 1);
    if (isDebug) {
      console.warn(
        `请求失败，准备在 ${delay}ms 后进行第 ${currentRetryCount + 1}/${retryCount} 次重试...`,
      );
    }
    // 等待指定时间后重试
    await new Promise((resolve) => setTimeout(resolve, delay));
    // 重试
    const result = await onRetry(currentRetryCount + 1);

    return { retried: true, result };
  }
  return { retried: false };
}
