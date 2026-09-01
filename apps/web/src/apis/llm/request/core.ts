import { createRequest } from "./request";

import { handleRetry, processError, processOption } from "./stream-utils";

/**
 * LLM 类用于管理与大语言模型的流式和非流式请求。
 * 支持多种 AI 供应商，提供重试机制和错误处理功能。
 */
class LLM {
  /** @type {string} 完整的请求地址 */
  url;
  /** @type {string} AI 供应商标识，如 'cool' 等 */
  provider;
  /** @type {string|undefined} 请求认证所需的 API Key */
  apiKey;
  /** @type {string|undefined} 默认模型名，request 时自动注入 */
  model;
  /**
   * 初始化 LLM 实例
   * @param {Object} config - 配置对象
   * @param {string} [config.url=""] - 完整的请求地址
   * @param {string} [config.provider="cool"] - AI 供应商标识，如 'cool' 等
   * @param {string} [config.apiKey] - 请求认证所需的 API Key
   * @param {string} [config.model] - 默认模型名
   */
  constructor(config: { url?: string; provider?: string; apiKey?: string; model?: string }) {
    const { url = "", provider = "cool", apiKey, model } = config;

    this.url = url;
    this.provider = provider;
    this.apiKey = apiKey;
    this.model = model;

    // 校验配置完整性，任一缺失时输出警告
    if (!this.url || !this.provider || !this.apiKey || !this.model) {
      console.warn("LLM 配置缺失，请检查！！！");
    }
  }
  /**
   * 发送平台对应的最小请求，检查模型连接是否可用
   */
  async ping() {
    const options: any = {
      thinking: { type: "disabled" },
    };
    if (this.provider === "openai") {
      options["messages"] = [{ role: "user", content: "连接测试，请回复 OK" }];
    } else if (this.provider === "ark") {
      options["input"] = [{ role: "user", content: "连接测试，请回复 OK" }];
    }
    const { sendFn } = await this.request({
      options,
      isStream: true,
      isJson: false,
      debug: false,
    });
    return sendFn();
  }
  /**
   * 创建并执行 AI 请求任务
   * @param {Object} config - 请求配置对象
   * @param {Object} [config.options={}] - 接口请求参数，包含请求所需的各种参数
   * @param {Function} [config.onSuccess] - 请求成功回调函数，接收解析后的结果
   * @param {Function} [config.onFail] - 请求失败回调函数，接收错误对象
   * @param {Function} [config.onEvent] - 通用事件回调函数，接收事件类型和数据
   * @param {Function} [config.onFinally] - 请求结束回调函数（无论成功或失败）
   * @param {boolean} [config.debug=true] - 是否开启调试模式，开启后会打印请求日志
   * @param {boolean} [config.isJson=true] - 接口返回数据是否为 JSON 格式
   * @param {string} [config.method="POST"] - 请求方法，默认为 POST
   * @param {boolean} [config.isThrow=true] - 发生错误时是否抛出异常
   * @param {number} [config.retryCount=0] - 请求失败时的重试次数
   * @param {number} [config.timeout=180000] - 请求超时时间，默认 180 秒
   * @param {boolean} [config.isStream=true] - 是否开启流式响应
   * @returns {Promise<any>} 返回请求结果的 Promise，包含 abortFn 和 sendFn
   */
  async request(config: any) {
    const {
      options = {},
      onSuccess,
      onFail,
      onEvent,
      onFinally,
      debug = true,
      isJson = true,
      method = "POST",
      retryCount = 3,
      isStream = true,
      timeout = 180000,
    } = config;
    const token = this.apiKey || "";
    if (debug) {
      console.log("请求配置 :>> ", config);
    }

    // 默认模型由实例注入
    const requestOptions = { ...options, model: this.model };

    // 提前创建处理器，确保调用方在 sendFn 执行前即可获取 abort
    const handler: any = createRequest(token, isStream);
    const send = handler?.send;
    const abort = handler?.abort;

    // 处理请求参数
    const sendFn = async (currentRetryCount = 0) => {
      // 标记是否正在重试
      let isRetrying = false;
      try {
        // 组装请求基础配置
        const requestConfig = {
          url: this.url,
          method,
          debug,
          provider: this.provider,
          timeout,
        };

        // 流式与非流式请求体不同，分别组装后发送
        const res = isStream
          ? await send?.({
              ...requestConfig,
              data: processOption({ options: requestOptions }),
              isJson,
              onEvent,
            })
          : await send?.({
              ...requestConfig,
              data: JSON.stringify(requestOptions),
            });
        // 主动中止时不触发成功回调
        if (!res?.aborted) {
          onSuccess?.(res);
        }
        return res;
      } catch (e) {
        const error = processError(e);

        // 处理重试逻辑
        const { retried, result } = await handleRetry({
          currentRetryCount,
          retryCount,
          debug,
          onRetry: sendFn,
        });
        // 重试后返回结果
        if (retried) {
          isRetrying = true;
          return result;
        }
        onFail?.(error);
        // 统一错误处理
        if (debug) {
          console.error("请求失败 :>> ", error);
        }
        throw e;
      } finally {
        if (!isRetrying) {
          onFinally?.();
        }
      }
    };

    return {
      abortFn: abort,
      sendFn,
    };
  }
}

export { LLM };
