import { getParser } from "../parser/index";

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
function safeJsonParse(str: string, isDebug: boolean) {
  try {
    return JSON.parse(str);
  } catch {
    // 仅当第一次失败时尝试补全
    try {
      const newStr = str + "}";
      if (isDebug) {
        console.log("原始内容:", str);
        console.log("尝试补全 JSON 字符串:", newStr);
      }
      return JSON.parse(newStr);
    } catch {
      throw new Error(`JSON 解析失败，原始内容: ${str}`);
    }
  }
}
export function processResult({ text, isJson = true, isDebug }: any) {
  // 输入校验：非字符串直接抛出
  if (typeof text !== "string") {
    throw new Error("最终结果为空，无法解析");
  }

  const trimmed = text.trim();
  // isJson=false 时允许空内容，如仅输出工具调用的中间步骤
  if (!trimmed && !isJson) {
    return "";
  }
  if (!trimmed) {
    throw new Error("最终结果为空，无法解析");
  }

  let result = trimmed;

  // JSON 解析（独立 try-catch）
  if (isJson) {
    try {
      result = safeJsonParse(trimmed, isDebug);
    } catch (err: any) {
      throw new Error(`最终结果解析失败: ${err.message}，原始内容: ${trimmed}`);
    }
  }

  // 调试输出与返回
  if (isDebug) {
    console.log("流式传输完成，最终结果:", result);
  }
  return result;
}
