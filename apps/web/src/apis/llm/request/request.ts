import { createStreamParser, getParser } from "../parser/index";
import { processResult } from "../parser/stream";
import { ApiError } from "../errors";

// 组装鉴权请求头
function processToken(token: string) {
  return `Bearer ${token}`;
}

type RequestConfig = {
  url: string;
  method: string;
  data: string;
  isJson?: boolean;
  onEvent?: any;
  isDebug: boolean;
  provider: string;
  timeout: number;
};

/**
 * 从错误响应体中提取服务端错误信息
 * 兼容 OpenAI 结构 { error: { message, code } }、{ message } 与纯文本响应体
 */
async function extractErrorInfo(response: Response) {
  let raw = "";
  try {
    raw = (await response.text()).trim();
  } catch {
    return { message: "", code: "" };
  }
  if (!raw) return { message: "", code: "" };
  try {
    const json = JSON.parse(raw);
    const err = json?.error ?? json;
    return {
      message: typeof err?.message === "string" ? err.message : "",
      code: typeof err?.code === "string" ? err.code : "",
    };
  } catch {
    // 非 JSON 响应体：截断原始文本用于提示
    return { message: raw.slice(0, 200), code: "" };
  }
}

/**
 * 创建请求处理器
 * @param {string} token 身份验证 Token
 * @param {boolean} [isStream=true] 是否为流式请求
 * @returns {{ send: Function, abort: Function }} 请求发送与取消函数
 */
export function createRequest(token: string, isStream = true) {
  // 请求控制器
  let controller: AbortController | null = null;

  /**
   * 取消当前请求
   * @description 取消当前正在执行的请求，释放资源
   */
  function abort() {
    if (!controller) {
      return;
    }
    controller.abort();
    controller = null;
  }

  /**
   * 发送请求
   * @description 发送请求，根据流式/非流式分别处理响应并返回结果
   */
  async function send({
    url,
    method,
    data,
    isJson,
    onEvent,
    isDebug,
    provider,
    timeout,
  }: RequestConfig) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isTimeoutAbort = false;

    // 取消当前请求
    abort();
    try {
      controller = new AbortController();
      timeoutId = setTimeout(() => {
        isTimeoutAbort = true;
        controller?.abort();
      }, timeout);

      // 发送请求
      const response = await fetch(url, {
        signal: controller.signal,
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: processToken(token),
        },
        body: data,
      });

      // 检查HTTP响应状态：提取错误体中的服务端原因透传给上层
      if (!response.ok) {
        const { message, code } = await extractErrorInfo(response);
        const reason = message || response.statusText;
        // message 汇总状态码、错误码与服务端原因，便于直接展示
        throw new ApiError(
          reason
            ? `${response.status}${code ? ` [${code}]` : ""}: ${reason}`
            : `请求失败 (HTTP ${response.status})`,
          response.status,
          code,
        );
      }

      // 流式：读取并解析流数据
      if (isStream) {
        // 检查响应体是否存在
        if (!response.body) {
          throw new ApiError("响应体为空，无法读取流式数据");
        }
        // 获取读取器和解码器
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        const parser = createStreamParser({ onEvent, isDebug, provider }); // 初始化解析器

        let currentContent = "";
        let finalUsage = null;

        // 循环读取流数据
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            const result = processResult({
              text: currentContent,
              isJson,
              isDebug,
            });
            return {
              result,
              usage: finalUsage,
            };
          }

          // 解码二进制数据
          const chunk = decoder.decode(value, { stream: true });
          const { content, usage } = parser(chunk);
          currentContent += content;
          if (usage) {
            finalUsage = usage;
          }
        }
      }

      // 非流式：解析 JSON 响应并通过非流式解析器处理
      const json = await response.json();
      const parser = getParser({ provider, isStream: false });
      return parser(json);
    } catch (error: any) {
      // 检查是否为主动取消
      if (error.name === "AbortError") {
        if (isTimeoutAbort) {
          throw new ApiError(`请求超时（${timeout}ms）`);
        }
        if (isDebug) console.log("请求被主动取消");
        return { aborted: true };
      }
      // 网络层失败（请求未发出或流传输中断），转为可读提示
      if (error instanceof TypeError) {
        throw new ApiError(`网络连接失败: ${error.message}`);
      }
      throw error;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      abort();
    }
  }

  return {
    send,
    abort,
  };
}
