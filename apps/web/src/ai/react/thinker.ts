import type { ChatMessage, ReactTool, ThinkResult, ToolCall } from "./types";

// Think 层配置
export interface ThinkOptions {
  // 可用工具，用于构造 function calling 参数
  tools: ReactTool[];
  // 模型名，可选
  model?: string;
  // 用于在请求进行中暴露中止函数
  abortRef?: { current: (() => void) | null };
}

// 按 index 合并流式 tool_call 增量，最终得到完整工具调用
function mergeToolCall(map: Map<number, ToolCall>, tc: any) {
  const index = typeof tc.index === "number" ? tc.index : 0;
  const cur = map.get(index) || {
    id: "",
    type: "function",
    function: { name: "", arguments: "" },
  };
  if (tc.id) cur.id = tc.id;
  if (tc.type) cur.type = tc.type;
  if (tc.function?.name) cur.function.name = tc.function.name;
  if (typeof tc.function?.arguments === "string") {
    cur.function.arguments += tc.function.arguments;
  }
  map.set(index, cur);
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
  const toolCallMap = new Map<number, ToolCall>();

  const requestOptions: any = {
    messages,
    tools: options.tools.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    })),
    tool_choice: "auto",
    thinking: { type: "disabled" },
    ...(options.model ? { model: options.model } : {}),
  };

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = (err?: any) => {
      if (settled) return;
      settled = true;
      if (err) reject(err);
      else resolve();
    };

    llm
      .request({
        options: requestOptions,
        isStream: true,
        isJson: false,
        onEvent: (type: string, data: any) => {
          if (type === "reasoning") reasoning += data;
          else if (type === "content") content += data;
          else if (type === "tool_call_delta") mergeToolCall(toolCallMap, data);
        },
        onSuccess: () => finish(),
        onFail: (error: any) => finish(new Error(error?.message || "ReAct 思考失败")),
      })
      .then(({ sendFn, abortFn }: any) => {
        if (options.abortRef) options.abortRef.current = abortFn;
        sendFn().then(() => finish()).catch((err: any) => finish(err));
      })
      .catch((err: any) => finish(err));
  });

  const toolCalls = Array.from(toolCallMap.values());
  console.log(
    "[ReAct Think] reasoning:",
    reasoning,
    "toolCalls:",
    toolCalls.map((t) => t.function.name),
  );
  return {
    reasoning,
    toolCalls,
    finalAnswer: toolCalls.length ? "" : content,
  };
}
