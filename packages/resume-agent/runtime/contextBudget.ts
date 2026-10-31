import type { ChatMessage, ContextCompactionOptions } from "@snowflake/ai";

// 兜底预算：入口没有提供压缩策略时仍限制上下文规模，避免长任务每轮重发全部历史
const FALLBACK_INPUT_TOKENS = 30000;

// 与上下文统计口径一致：中文按一字一令牌，其余按四字符一令牌
const countTextTokens = (text: string) => {
  const cjk = text.match(/[\u3400-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
  return cjk + Math.ceil((text.length - cjk) / 4);
};

const countMessagesTokens = (messages: readonly ChatMessage[]) =>
  messages.reduce((total, message) => {
    const contentTokens = countTextTokens(message.content ?? "");
    const callTokens = message.tool_calls ? countTextTokens(JSON.stringify(message.tool_calls)) : 0;
    return total + contentTokens + callTokens;
  }, 0);

// 兜底压缩只做规则化省略，不额外调用模型，避免压缩本身产生请求
export const fallbackContextCompaction: ContextCompactionOptions = {
  maxInputTokens: FALLBACK_INPUT_TOKENS,
  countTokens: countMessagesTokens,
  summarize: (messages) => `此前 ${messages.length} 条较早的对话与工具结果已省略；需要最新数据时重新读取。`,
};
