import { createRequest } from "./request";
import { AbortError } from "../errors";

import { executeToolCall } from "../react/actor";
import { observe } from "../react/observer";
import { think } from "../react/thinker";
import { ToolRegistry } from "../react/tools";
import type { ChatMessage, ReactConfig } from "../react/types";

// 从模型输出中提取 JSON 对象，忽略 JSON 前后的自然语言；json_object 模式已保证输出 JSON
function extractJson(text: string): string {
  if (!text) return text;
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

// 组装请求体：强制开启流式响应
function processOption({ options }: any) {
  return JSON.stringify({
    ...options,
    stream: true, // 强制开启流式响应
  });
}

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
      isDebug: false,
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
   * @param {boolean} [config.isDebug=true] - 是否开启调试模式，开启后会打印请求日志
   * @param {boolean} [config.isJson=true] - 接口返回数据是否为 JSON 格式
   * @param {string} [config.method="POST"] - 请求方法，默认为 POST
   * @param {number} [config.retryCount=3] - 请求失败时的重试次数
   * @param {number} [config.timeout=300000] - 请求超时时间，默认 5 分钟
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
      isDebug = true,
      isJson = true,
      method = "POST",
      retryCount = 3,
      isStream = true,
      timeout = 300000,
    } = config;
    const token = this.apiKey || "";
    if (isDebug) {
      console.log("请求配置 :>> ", config);
    }

    // 默认模型由实例注入
    const requestOptions = { ...options, model: this.model };

    // 提前创建处理器，确保调用方在 sendFn 执行前即可获取 abort
    const handler = createRequest(token, isStream);
    const send = handler.send;
    const abort = handler.abort;

    // 发送函数：失败按重试次数循环重试，4xx 客户端错误（429 除外）不再重试
    const sendFn = async () => {
      try {
        for (let attempt = 1; ; attempt++) {
          try {
            // 组装请求基础配置
            const requestConfig = {
              url: this.url,
              method,
              isDebug,
              provider: this.provider,
              timeout,
            };

            // 流式与非流式请求体不同，分别组装后发送
            const res = isStream
              ? await send({
                  ...requestConfig,
                  data: processOption({ options: requestOptions }),
                  isJson,
                  onEvent,
                })
              : await send({
                  ...requestConfig,
                  data: JSON.stringify(requestOptions),
                });
            // 主动中止时不触发成功回调
            if (!res?.aborted) {
              onSuccess?.(res);
            }
            return res;
          } catch (e: any) {
            // 判断是否可重试：4xx 客户端错误（429 限流除外）重试无意义
            const status = e?.status;
            const retryable = !(status && status >= 400 && status < 500 && status !== 429);
            // 尝试次数耗尽或不可重试时，跳出循环按最终失败处理
            if (attempt > retryCount || !retryable) {
              throw e;
            }
            const delay = 500 * attempt;
            if (isDebug) {
              console.warn(
                `请求失败，准备在 ${delay}ms 后进行第 ${attempt}/${retryCount} 次重试...`,
              );
            }
            // 等待指定时间后进入下一次尝试
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      } catch (e) {
        onFail?.(e);
        // 统一错误处理
        if (isDebug) {
          console.error("请求失败 :>> ", e);
        }
        throw e;
      } finally {
        // 无论成功或重试耗尽，结束回调仅触发一次
        onFinally?.();
      }
    };

    return {
      abortFn: abort,
      sendFn,
    };
  }
  /**
   * 以 ReAct（思考-执行-观察）模式发起多轮请求，直到模型给出最终答案或超过最大步数
   * @param {Object} config - ReAct 配置，包含工具与各阶段回调
   * @returns {{ abort: Function, run: Function }} 中止函数与执行函数
   */
  react(config: ReactConfig) {
    let aborted = false;
    const abortRef: { current: (() => void) | null } = { current: null };
    const registry = new ToolRegistry();
    config.tools.forEach((t) => registry.register(t));

    const abort = () => {
      aborted = true;
      abortRef.current?.();
    };

    const run = async (initialMessages: ChatMessage[]): Promise<string> => {
      const maxSteps = config.maxSteps ?? 6;
      const history: ChatMessage[] = [...initialMessages];
      // 标记候选答案后是否已进入反思轮，反思轮输出作为最终结果
      let reflectRound = false;

      // 打印 ReAct 运行过程，便于观察每一步发生了什么
      console.log("[ReAct] 开始运行，消息数:", initialMessages.length, "最大步数:", maxSteps);

      for (let step = 0; step < maxSteps; step++) {
        if (aborted) throw new AbortError();

        console.log(`[ReAct] 第 ${step + 1}/${maxSteps} 步 Think`);
        const result = await think(this, history, {
          tools: config.tools,
          model: config.model,
          thinking: config.thinking,
          abortRef,
          onEvent: config.onEvent,
        });

        if (aborted) throw new AbortError();

        if (result.reasoning) console.log("[ReAct] 思考:", result.reasoning);
        console.log("[ReAct] 工具调用:", result.toolCalls);

        config.onThink?.(result.reasoning);

        // 无工具调用时，若开启反思且尚未进入反思轮，则先注入候选答案并让下一轮审视定稿
        if (!result.toolCalls.length) {
          const finalAnswer = extractJson(result.finalAnswer);

          if (config.reflection && !reflectRound && step < maxSteps - 1) {
            console.log("[ReAct] 候选答案，下一轮反思定稿:", finalAnswer);
            // 通知前端进入反思轮，便于实时渲染最终正文
            config.onReflectStart?.();
            // 候选答案回填历史，反思轮携带完整执行过程审视并输出最终答案
            history.push({ role: "assistant", content: result.finalAnswer });
            history.push({
              role: "user",
              content:
                "请反思你上面的答案：审视是否满足任务要求、格式是否正确，内容是否有遗漏或错误。若有问题，输出修正后的完整答案；若无问题，原样输出最终答案。",
            });
            reflectRound = true;
            continue;
          }

          console.log("[ReAct] 最终答案:", finalAnswer);
          if (reflectRound) config.onReflect?.(finalAnswer);
          config.onFinal?.(finalAnswer);
          return finalAnswer;
        }

        // 回填 assistant 的工具调用消息
        history.push({
          role: "assistant",
          content: null,
          tool_calls: result.toolCalls,
        });

        for (const toolCall of result.toolCalls) {
          if (aborted) throw new AbortError();

          console.log(
            "[ReAct] 执行工具:",
            toolCall.function.name,
            "参数:",
            toolCall.function.arguments,
          );
          config.onAct?.(toolCall);
          const raw = await executeToolCall(registry, toolCall);
          const observation = observe(toolCall, raw);
          // 观察结果可能包含整份简历，截断打印避免刷屏
          const observePreview =
            observation.content.length > 2000
              ? observation.content.slice(0, 2000) + "..."
              : observation.content;
          console.log(
            "[ReAct] 观察结果(" + observation.content.length + "字符):",
            observePreview,
          );
          config.onObserve?.(observation);

          history.push({
            role: "tool",
            content: observation.content,
            tool_call_id: observation.toolCallId,
          });
        }
      }

      console.warn("[ReAct] 超出最大步数");
      throw new Error("ReAct 超出最大步数");
    };

    return { abort, run };
  }
}

export { LLM };
