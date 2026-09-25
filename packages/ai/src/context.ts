import type { ChatMessage } from "./react/types.js";

export interface ContextCompactionOptions {
  // 消息可用预算由调用方按模型窗口、工具定义和输出预留量计算。
  maxInputTokens: number;
  countTokens: (messages: readonly ChatMessage[]) => number | Promise<number>;
  summarize: (messages: readonly ChatMessage[], targetTokens: number, signal?: AbortSignal) => string | Promise<string>;
  onCompacted?: (info: { beforeTokens: number; afterTokens: number; removed: ChatMessage[]; summary: ChatMessage }) => void;
  signal?: AbortSignal;
}

type MessageGroup = { start: number; end: number };

// 工具调用与紧随其后的工具结果视为一组，压缩时不拆开协议消息。
function groupMessages(messages: readonly ChatMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  for (let index = 0; index < messages.length;) {
    const start = index++;
    if (messages[start].role === "assistant" && messages[start].tool_calls?.length) {
      while (index < messages.length && messages[index].role === "tool") index++;
    } else if (messages[start].role === "tool") {
      while (index < messages.length && messages[index].role === "tool") index++;
    }
    groups.push({ start, end: index });
  }
  return groups;
}

function checkedTokens(value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new Error("上下文令牌计数必须是非负有限数");
  return value;
}

/** 压缩待发送消息的副本，保留系统消息、最新用户消息及最新消息组。 */
export async function prepareContext(
  messages: readonly ChatMessage[],
  options: ContextCompactionOptions,
): Promise<ChatMessage[]> {
  if (!Number.isFinite(options.maxInputTokens) || options.maxInputTokens <= 0) {
    throw new Error("上下文输入预算必须是正数");
  }
  let result = [...messages];
  const createdSummaries = new Set<ChatMessage>();
  let total = checkedTokens(await options.countTokens(result));

  while (total > options.maxInputTokens) {
    if (options.signal?.aborted) throw new Error("上下文压缩已中止");
    const groups = groupMessages(result);
    let latestUser = -1;
    for (let index = result.length - 1; index >= 0; index--) {
      if (result[index].role === "user") {
        latestUser = index;
        break;
      }
    }
    const regions: MessageGroup[] = [];
    let active: MessageGroup | null = null;

    // 仅选择连续的旧消息，保留指令、当前问题及最近一次工具交互的顺序。
    for (const [index, group] of groups.entries()) {
      const slice = result.slice(group.start, group.end);
      const protectedGroup = index === groups.length - 1 ||
        slice.some((message, messageIndex) =>
          message.role === "system" || group.start + messageIndex === latestUser || createdSummaries.has(message),
        );
      if (protectedGroup) {
        if (active) regions.push(active);
        active = null;
      } else if (active) {
        active.end = group.end;
      } else {
        active = { ...group };
      }
    }
    if (active) regions.push(active);
    if (!regions.length) throw new Error("上下文超出预算，且没有可压缩的旧消息");

    // 优先压缩令牌最多的旧消息段，减少额外的摘要请求。
    const sizes = await Promise.all(regions.map(async (region) =>
      checkedTokens(await options.countTokens(result.slice(region.start, region.end)))));
    const selected = regions[sizes.indexOf(Math.max(...sizes))];
    const removed = result.slice(selected.start, selected.end);
    const targetTokens = Math.max(1, sizes[regions.indexOf(selected)] - (total - options.maxInputTokens));
    const summaryText = await options.summarize(removed, targetTokens, options.signal);
    if (options.signal?.aborted) throw new Error("上下文压缩已中止");
    if (!summaryText.trim()) throw new Error("上下文摘要不能为空");
    const summary: ChatMessage = { role: "user", content: `此前对话摘要：\n${summaryText}` };
    const next = [...result.slice(0, selected.start), summary, ...result.slice(selected.end)];
    const nextTotal = checkedTokens(await options.countTokens(next));
    if (nextTotal >= total) throw new Error("上下文摘要未缩减令牌数");
    options.onCompacted?.({ beforeTokens: total, afterTokens: nextTotal, removed, summary });
    createdSummaries.add(summary);
    result = next;
    total = nextTotal;
  }

  return result;
}
