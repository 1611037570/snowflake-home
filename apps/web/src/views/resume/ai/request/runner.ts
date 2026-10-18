import { readResumeAiResponseText } from "./response";
import type {
  ResumeAiMessage,
  ResumeAiTask,
  RunResumeAiTaskOptions,
} from "./types";

// 主动中止错误：保持与请求库一致的 name，供调用方识别
const createAbortError = () => {
  const error = new Error("已中止");
  error.name = "AbortError";
  return error;
};

// 按协议把文本消息放入请求体
const buildBodyFromMessages = (
  protocol: "chatCompletions" | "responses",
  messages: ResumeAiMessage[],
  extraOptions?: Record<string, unknown>,
) => ({
  ...(protocol === "responses" ? { input: messages } : { messages }),
  ...extraOptions,
});

// 统一执行一次性简历 AI 任务：协议、超时、中止、重试与响应归一化
export const runResumeAiTask = async <Input, Output = string>(
  task: ResumeAiTask<Input>,
  input: Input,
  options: RunResumeAiTaskOptions<Output> = {},
): Promise<Output> => {
  // 调用方已注入模型时不再加载模型解析模块，避免无关请求引入额外依赖
  let llm = options.llm;
  if (!llm) {
    const { getResumeAiModel } = await import("./client");
    llm = getResumeAiModel(task.agent);
    if (!llm || !llm.apiKey || !llm.url || !llm.model) {
      throw new Error(task.modelErrorMessage ?? "请先配置并选择 AI 模型");
    }
  }
  if (options.signal?.aborted) throw createAbortError();
  // 多模态任务按协议自行组装，其余任务统一按协议放置消息
  const body = task.buildBody
    ? { ...task.buildBody(input, llm.protocol), ...task.extraOptions }
    : buildBodyFromMessages(
        llm.protocol,
        task.buildMessages?.(input) ?? [],
        task.extraOptions,
      );
  // 监控摘要任务先建立记录，避免请求库按完整请求体记录图片
  let traceId: string | undefined;
  let finishAbortedTrace: (() => void) | undefined;
  if (task.traceInput) {
    const monitor = await import("@/apis/llm/monitor");
    // 创建失败时使用占位标识，阻止请求库再次按完整请求体建立记录
    traceId =
      monitor.createLlmTrace({
        provider: llm.provider,
        model: llm.model,
        input: task.traceInput(input),
      }) || "resume-ai-trace-unavailable";
    finishAbortedTrace = () => monitor.finishLlmTrace(traceId!, "aborted");
  }
  if (options.signal?.aborted) {
    finishAbortedTrace?.();
    throw createAbortError();
  }
  // 流式任务由统一使用方累积正文，调用方只接收增量
  let streamed = "";
  const handleContent = (delta: string) => {
    streamed += delta;
    options.onContent?.(delta);
  };
  const { sendFn, abortFn, traceId: requestTraceId } = await llm.request({
    options: body,
    isStream: task.stream,
    isJson: false,
    isDebug: false,
    retryCount: task.retryCount ?? 0,
    timeout: task.timeout,
    ...(traceId ? { traceId } : {}),
    onContent: handleContent,
    onReasoning: options.onReasoning,
    onToken: options.onToken,
  });
  const onAbort = () => abortFn?.();
  options.signal?.addEventListener("abort", onAbort, { once: true });
  if (options.signal?.aborted) {
    onAbort();
    // 请求尚未发出时主动收口监控记录，避免遗留未完成的记录
    if (requestTraceId) {
      const monitor = await import("@/apis/llm/monitor");
      monitor.finishLlmTrace(requestTraceId, "aborted");
    }
    throw createAbortError();
  }
  try {
    const response = await sendFn();
    // 请求库主动取消时返回标记而不是抛错，这里统一转为中止错误
    if ((response as any)?.aborted || options.signal?.aborted) throw createAbortError();
    const text = task.stream ? streamed : readResumeAiResponseText(response);
    const parse = options.parse ?? task.parse;
    if (parse) return parse(response, text) as Output;
    return text as unknown as Output;
  } finally {
    options.signal?.removeEventListener("abort", onAbort);
  }
};
