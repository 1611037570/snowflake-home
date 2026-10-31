import type { ChatMessage, ReactTool, ThinkResult, ToolCall } from "./types.js";

// Think 层配置
export interface ThinkOptions {
  // 可用工具，用于构造 function calling 参数
  tools: ReactTool[];
  // 本轮指定的工具；不传时由模型自行决定是否调用工具。
  toolChoice?: string;
  // 模型名，可选
  model?: string;
  // 思考模式，不传时默认禁用
  thinking?: { type: "enabled" | "disabled" };
  // 用于在请求进行中暴露中止函数
  abortRef?: { current: (() => void) | null };
  // 透传底层流式事件，用于上层计时与统计
  onEvent?: (type: string, data: any) => void;
  // 模型输出增量由独立回调交给上层处理。
  onReasoning?: (delta: string) => void;
  onContent?: (delta: string) => void;
  onToken?: (totalTokens: number) => void;
  // 复用 ReAct 工作流的观测标识，避免每轮推理提前结束观测。
  traceId?: string;
}

// 请求协议：对话补全按 messages 编排，响应接口按 input 条目编排。
type ReactProtocol = "chatCompletions" | "responses";

// 按 index 合并流式 tool_call 增量，最终得到完整工具调用。
// 响应接口没有 index，改按调用项标识合并，两个协议共用同一份累积结构。
function mergeToolCall(map: Map<string | number, ToolCall>, tc: any) {
  const key = typeof tc.index === "number" ? tc.index : (tc.item_id ?? tc.id ?? 0);
  const cur: ToolCall = map.get(key) || {
    id: "",
    type: "function",
    function: { name: "", arguments: "" },
  };
  if (tc.id) cur.id = tc.id;
  if (tc.type) cur.type = tc.type;
  // Gemini 等兼容接口在工具调用上附带思考签名，不能在合并增量时丢弃。
  if (tc.extra_content && typeof tc.extra_content === "object") {
    cur.extra_content = { ...cur.extra_content, ...tc.extra_content };
  }
  // 响应接口把工具名放在调用项事件上，不在 function.name 里
  const name = tc.function?.name || tc.name;
  if (name) cur.function.name = name;
  const args = typeof tc.function?.arguments === "string" ? tc.function.arguments : tc.arguments;
  if (typeof args === "string") {
    cur.function.arguments += args;
  }
  map.set(key, cur);
}

// 响应接口的输入条目：助手工具调用与工具结果都是独立条目，不能沿用对话补全的角色消息。
function toResponsesInput(messages: ChatMessage[]) {
  const items: Record<string, unknown>[] = [];
  messages.forEach((message) => {
    if (message.role === "tool") {
      items.push({
        type: "function_call_output",
        call_id: message.tool_call_id ?? "",
        output: message.content ?? "",
      });
      return;
    }
    if (message.role === "assistant" && message.tool_calls?.length) {
      // 空正文的助手消息会被服务端拒绝，只在确有文本时保留
      if (message.content) items.push({ role: "assistant", content: message.content });
      message.tool_calls.forEach((call) => {
        items.push({
          type: "function_call",
          call_id: call.id,
          name: call.function.name,
          arguments: call.function.arguments,
        });
      });
      return;
    }
    items.push({ role: message.role, content: message.content ?? "" });
  });
  return items;
}

// 按协议组装工具定义：响应接口把函数字段平铺在工具项上。
function toToolDefinitions(tools: ReactTool[], protocol: ReactProtocol) {
  if (protocol === "responses") {
    return tools.map((tool) => ({
      type: "function",
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));
  }
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

// 按协议组装首选工具：响应接口不再包一层 function。
function toToolChoice(toolChoice: string | undefined, protocol: ReactProtocol) {
  if (!toolChoice) return "auto";
  return protocol === "responses"
    ? { type: "function", name: toolChoice }
    : { type: "function", function: { name: toolChoice } };
}

/**
 * 执行一次模型推理，累积思考内容、工具调用与最终答案
 */
export async function think(
  llm: any,
  messages: ChatMessage[],
  options: ThinkOptions,
): Promise<ThinkResult> {
  let reasoning = "";
  let content = "";
  const toolCallMap = new Map<string | number, ToolCall>();
  // 协议来自模型实例，工具循环与单次请求共用同一套协议判断。
  const protocol: ReactProtocol = llm.protocol === "responses" ? "responses" : "chatCompletions";

  // 工具集被宿主收敛为空时按普通对话请求，不发送空的工具声明
  const toolDefinitions = toToolDefinitions(options.tools, protocol);
  const requestOptions: any = {
    ...(protocol === "responses"
      ? { input: toResponsesInput(messages) }
      : { messages }),
    ...(toolDefinitions.length
      ? {
          tools: toolDefinitions,
          // 明确操作任务可指定首轮工具，其余轮次保持模型自主选择。
          tool_choice: toToolChoice(options.toolChoice, protocol),
        }
      : {}),
    thinking: options.thinking ?? { type: "disabled" },
    ...(options.model ? { model: options.model } : {}),
  };

  const { sendFn, abortFn } = await llm.request({
    options: requestOptions,
    isStream: true,
    isJson: false,
    traceId: options.traceId,
    deferTraceFinish: Boolean(options.traceId),
    // 流式增量无法回滚：重试会把上一轮正文与工具参数重复拼进累积器
    retryCount: 0,
    onReasoning: (delta: string) => {
      reasoning += delta;
      options.onReasoning?.(delta);
    },
    onContent: (delta: string) => {
      content += delta;
      options.onContent?.(delta);
    },
    onToken: (totalTokens: number) => options.onToken?.(totalTokens),
    onEvent: (type: string, data: any) => {
      if (type === "tool_call_delta") mergeToolCall(toolCallMap, data);
      options.onEvent?.(type, data);
    },
  });
  if (options.abortRef) options.abortRef.current = abortFn;
  await sendFn();

  const toolCalls = Array.from(toolCallMap.values());
  return {
    reasoning,
    toolCalls,
    finalAnswer: toolCalls.length ? "" : content,
  };
}
