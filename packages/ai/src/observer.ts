export type LlmTraceStatus =
  | "pending"
  | "requesting"
  | "streaming"
  | "tool_calling"
  | "success"
  | "error"
  | "aborted"
  | "timeout";

export type LlmTraceEventType =
  | "created"
  | "round_start"
  | "round_complete"
  | "request"
  | "response"
  | "first_token"
  | "retry"
  | "tool_call"
  | "tool_result"
  | "error"
  | "complete";

// 宿主可注入观测实现，包内仅调用接口而不持有存储。
export interface LlmObserver {
  createLlmTrace(options: { provider: string; model?: string; input: unknown }): string;
  updateLlmTraceStatus(id: string, status: LlmTraceStatus): void;
  recordLlmTraceEvent(id: string, type: LlmTraceEventType, data?: unknown): void;
  markLlmTraceFirstToken(id: string): void;
  appendLlmTraceReasoning(id: string, content: unknown): void;
  appendLlmTraceOutput(id: string, content: unknown): void;
  setLlmTraceOutput(id: string, content: unknown): void;
  updateLlmTraceUsage(id: string, usage: unknown): void;
  finishLlmTrace(
    id: string,
    status: Extract<LlmTraceStatus, "success" | "error" | "aborted" | "timeout">,
    error?: unknown,
  ): void;
}

// 未注入观测器时请求仍可独立运行。
export const noopLlmObserver: LlmObserver = {
  createLlmTrace: () => "",
  updateLlmTraceStatus: () => {},
  recordLlmTraceEvent: () => {},
  markLlmTraceFirstToken: () => {},
  appendLlmTraceReasoning: () => {},
  appendLlmTraceOutput: () => {},
  setLlmTraceOutput: () => {},
  updateLlmTraceUsage: () => {},
  finishLlmTrace: () => {},
};
