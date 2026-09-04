// ReAct（思考-执行-观察）编排层类型定义

// 单个工具定义，遵循 OpenAI function calling 约定
export interface ReactTool {
  // 工具名，模型据此选择要调用的工具
  name: string;
  // 工具用途说明，帮助模型判断何时调用
  description: string;
  // 参数 JSON Schema
  parameters: Record<string, any>;
  // 执行函数，输入输出均可序列化，便于测试
  execute: (args: any) => unknown | Promise<unknown>;
}

// 模型输出的一次工具调用
export interface ToolCall {
  // 调用唯一标识，回填 tool 消息时使用
  id: string;
  // 函数类型，openai 协议固定为 function
  type: string;
  function: {
    // 工具名
    name: string;
    // 参数 JSON 字符串，流式分片累积后拼接
    arguments: string;
  };
}

// Think 层输出：一次模型推理的结果
export interface ThinkResult {
  // 思考内容（模型 reasoning，可能为空）
  reasoning: string;
  // 模型决定的工具调用列表，为空表示本次已给出最终答案
  toolCalls: ToolCall[];
  // 最终答案文本，仅当无工具调用时有值
  finalAnswer: string;
}

// Observe 层输出：工具执行结果的格式化观察
export interface Observation {
  // 对应的工具调用 id
  toolCallId: string;
  // 序列化后的观察文本，回填为 tool 消息内容
  content: string;
}

// ReAct 运行配置，集中在 LLM.react 内部使用，避免污染单轮请求流程
export interface ReactConfig {
  // 可用工具列表
  tools: ReactTool[];
  // 最大循环步数，防止死循环
  maxSteps?: number;
  // 模型名，存在时透传到请求 options
  model?: string;
  // 思考模式，不传时默认禁用
  thinking?: { type: "enabled" | "disabled" };
  // 思考回调：每一步思考内容
  onThink?: (reasoning: string) => void;
  // 执行回调：每次工具调用
  onAct?: (toolCall: ToolCall) => void;
  // 观察回调：每次工具执行结果
  onObserve?: (observation: Observation) => void;
  // 是否在最终答案后追加反思阶段，辅助修正不稳定输出
  reflection?: boolean;
  // 反思回调：反思后的最终答案
  onReflect?: (answer: string) => void;
  // 流式事件回调：透传 reasoning/content/total_tokens 等底层事件，用于计时与统计
  onEvent?: (type: string, data: any) => void;
  // 最终答案回调
  onFinal?: (answer: string) => void;
}

// 组装给模型的聊天消息
export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}
