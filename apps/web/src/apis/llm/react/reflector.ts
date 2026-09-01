import type { ChatMessage } from "./types";

// Reflect 层配置
export interface ReflectOptions {
  // 模型名，可选
  model?: string;
  // 用于在请求进行中暴露中止函数
  abortRef?: { current: (() => void) | null };
}

/**
 * 对 ReAct 最终答案做一次反思，让模型审视并修正输出
 */
export async function reflect(
  llm: any,
  answer: string,
  task: string,
  options: ReflectOptions,
): Promise<string> {
  let content = "";

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "你是反思助手。请审视下面的答案是否满足任务要求，格式是否正确，内容是否有遗漏或错误。若答案没有问题则原样返回，有问题则输出修正后的完整答案。",
    },
    {
      role: "user",
      content: `任务：\n${task}\n\n待反思答案：\n${answer}`,
    },
  ];

  const requestOptions: any = {
    messages,
    thinking: { type: "disabled" },
    ...(options.model ? { model: options.model } : {}),
  };

  const { sendFn, abortFn } = await llm.request({
    options: requestOptions,
    isStream: true,
    isJson: false,
    onEvent: (type: string, data: any) => {
      if (type === "content") content += data;
    },
  });
  if (options.abortRef) options.abortRef.current = abortFn;
  await sendFn();

  return content;
}
