import {
  createStreamParser,
  ERROR_CODES,
  processResult,
  processToken,
  StreamError,
} from "./stream-utils";

type StreamRequestConfig = {
  url: string;
  method: string;
  data: string;
  isJson: boolean;
  onEvent: any;
  debug: boolean;
  provider: string;
  timeout?: number;
};

export function streamRequest(token: string) {
  let controller: AbortController | null = null;

  function abort() {
    if (!controller) {
      return;
    }
    controller.abort();
    controller = null;
  }
  async function send({
    url,
    method,
    data,
    isJson,
    onEvent,
    debug,
    provider,
    timeout = 60000,
  }: StreamRequestConfig) {
    abort();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isTimeoutAbort = false;
    try {
      controller = new AbortController();
      const signal = controller.signal;
      timeoutId = setTimeout(() => {
        isTimeoutAbort = true;
        controller?.abort();
      }, timeout);
      // 发送流式请求
      const response = await fetch(url, {
        signal,
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: processToken(token),
        },
        body: data,
      });
      // 检查HTTP响应状态
      if (!response.ok) {
        throw new StreamError(`请求失败 :>> ${response.statusText}`, ERROR_CODES.NETWORK_ERROR);
      }
      // 检查响应体是否存在
      if (!response.body) {
        throw new StreamError("响应体为空，无法读取流式数据", ERROR_CODES.NETWORK_ERROR);
      }
      // 获取读取器和解码器
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      const parser = createStreamParser({ onEvent, debug, provider }); // 初始化解析器

      let currentContent = "";
      let finalUsage = null;

      // 循环读取流数据
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          const result = processResult({
            text: currentContent,
            isJson,
            debug,
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
    } catch (error: any) {
      // 检查是否为主动取消
      if (error.name === "AbortError") {
        if (isTimeoutAbort) {
          throw new StreamError(`请求超时（${timeout}ms）`, ERROR_CODES.NETWORK_ERROR);
        }
        if (debug) console.log("请求被主动取消");
        return { aborted: true };
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
