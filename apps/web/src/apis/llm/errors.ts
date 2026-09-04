/**
 * 统一接口错误：message 可直接展示到聊天气泡，status/code 供重试策略判断
 */
export class ApiError extends Error {
  status?: number;
  code?: string;
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (code) this.code = code;
  }
}

/**
 * 主动中止错误：用户停止生成时抛出，区别于真实请求失败
 */
export class AbortError extends Error {
  constructor() {
    super("已中止");
    this.name = "AbortError";
  }
}

// 主动中止判定：兼容自定义 AbortError 与 fetch 原生中止错误
export const isAbortError = (error: any) => !!error && error.name === "AbortError";
