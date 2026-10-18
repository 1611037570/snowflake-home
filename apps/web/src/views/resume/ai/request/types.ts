import type { LLM } from "@/apis/llm";

// 简历 AI 模型角色：普通简历任务、面试回答、PDF 解析
export type ResumeAiAgent = "xiaoZhou" | "xiaoYang" | "resumeParser";

// 模型接口协议：对话补全与响应接口
export type ResumeAiProtocol = "chatCompletions" | "responses";

// 协议无关的文本消息
export type ResumeAiMessage = {
  // 消息角色
  role: "system" | "user" | "assistant";
  // 文本内容
  content: string;
};

// 一次性简历 AI 任务的差异声明：公共请求生命周期由统一使用方处理
export type ResumeAiTask<Input> = {
  // 调用哪个模型角色
  agent: ResumeAiAgent;
  // 是否流式返回
  stream: boolean;
  // 超时毫秒，缺省沿用请求库默认值
  timeout?: number;
  // 失败重试次数，缺省不重试
  retryCount?: number;
  // 模型未配置时的提示文案
  modelErrorMessage?: string;
  // 协议无关的文本消息，普通文本任务使用
  buildMessages?: (input: Input) => ResumeAiMessage[];
  // 完整请求体，多模态等需要按协议组装的特殊任务使用
  buildBody?: (input: Input, protocol: ResumeAiProtocol) => Record<string, unknown>;
  // 附加在请求体上的公共参数，例如关闭思考
  extraOptions?: Record<string, unknown>;
  // 非流式响应解析；流式任务可不提供
  parse?: (response: unknown, text: string) => unknown;
  // 监控摘要，提供时创建独立记录，避免把图片或隐私写入请求日志
  traceInput?: (input: Input) => unknown;
};

// 统一使用方的调用选项
export type RunResumeAiTaskOptions<Output = string> = {
  // 已解析的模型实例，调用方已按角色取到模型时传入
  llm?: LLM;
  // 外部取消信号，触发后中止当前请求
  signal?: AbortSignal;
  // 流式正文增量
  onContent?: (delta: string) => void;
  // 流式思考增量
  onReasoning?: (delta: string) => void;
  // Token 统计
  onToken?: (totalTokens: number) => void;
  // 覆盖任务自带的响应解析
  parse?: (response: unknown, text: string) => Output;
};
