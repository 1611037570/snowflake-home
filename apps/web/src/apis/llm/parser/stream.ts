// 流解析通用原语：清洗与收尾，供各 provider 行解析器与传输层复用

// 清洗并解析单条 SSE 数据：移除 data: 前缀，校验为标准 JSON 对象后解析
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

// 解析最终结果：优先直接解析，失败时尝试补全右括号
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

// 处理流结束时的完整文本：isJson=false 时允许空内容（如仅输出工具调用的中间步骤）
export function processResult({ text, isJson = true, isDebug }: any) {
  // 输入校验：非字符串直接抛出
  if (typeof text !== "string") {
    throw new Error("最终结果为空，无法解析");
  }

  const trimmed = text.trim();
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
