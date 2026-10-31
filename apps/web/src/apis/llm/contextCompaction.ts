import type { ChatMessage, ContextCompactionOptions } from "@snowflake/ai";
import { runResumeAiTask, type ResumeAiTask } from "@snowflake/resume-agent";

// 输入预算：按单轮实际上下文控制，历史增长到该值即压缩，避免长对话每轮重复付费
const INPUT_TOKEN_BUDGET = 16000;
// 工具定义与常驻规则每轮固定占用，计入预算避免统计口径偏小
const FIXED_OVERHEAD_TOKENS = 4000;
// 单条历史进入摘要的最大字符数，避免摘要请求本身溢出
const TRANSCRIPT_MESSAGE_LIMIT = 1500;
// 摘要失败时的退化说明，保证上下文仍能缩减
const OMITTED_NOTICE = "此前对话已省略。";

// 粗估令牌：中文字符按 1 计，其余按 4 字符 1 个计，不引入分词依赖
const countTextTokens = (text: string) => {
  const cjk = text.match(/[\u3400-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
  return cjk + Math.ceil((text.length - cjk) / 4);
};

const countMessagesTokens = (messages: readonly ChatMessage[]) =>
  messages.reduce((total, message) => {
    const contentTokens = countTextTokens(message.content ?? "");
    const callTokens = message.tool_calls ? countTextTokens(JSON.stringify(message.tool_calls)) : 0;
    return total + contentTokens + callTokens;
    // 固定开销先计入，历史可用预算与实际请求一致
  }, FIXED_OVERHEAD_TOKENS);

const toTranscript = (messages: readonly ChatMessage[]) =>
  messages
    .map((message) => {
      const text = (message.content ?? "").trim();
      if (!text) return "";
      const clipped =
        text.length > TRANSCRIPT_MESSAGE_LIMIT ? `${text.slice(0, TRANSCRIPT_MESSAGE_LIMIT)}…` : text;
      return `【${message.role}】${clipped}`;
    })
    .filter(Boolean)
    .join("\n");

// 摘要任务只保留后续还需要的事实与结论，不复述工具过程
const SUMMARY_TASK: ResumeAiTask<{ transcript: string }> = {
  agent: "xiaoZhou",
  stream: false,
  retryCount: 1,
  timeout: 20000,
  buildMessages: ({ transcript }) => [
    {
      role: "system",
      content:
        "压缩以下简历助手的历史对话。只保留用户目标、已确认的简历事实、已完成的写入和仍待补充的信息；不要保留工具调用过程、思考内容和客套话。用简洁中文分条输出，不得新增事实。",
    },
    { role: "user", content: transcript },
  ],
};

// 摘要长度上限：按目标令牌换算字符，防止摘要本身过长导致压缩失败
const limitSummary = (text: string, targetTokens: number) => {
  const maxChars = Math.max(120, Math.min(1500, Math.floor(targetTokens)));
  return text.length > maxChars ? `${text.slice(0, maxChars)}…` : text;
};

// 上下文压缩适配：超出预算时把较早的历史压成一条摘要，避免长对话越聊越贵、越聊越笨
export const resumeContextCompaction: ContextCompactionOptions = {
  maxInputTokens: INPUT_TOKEN_BUDGET,
  countTokens: countMessagesTokens,
  summarize: async (messages, targetTokens, signal) => {
    const transcript = toTranscript(messages);
    if (!transcript) return OMITTED_NOTICE;
    try {
      const summary = await runResumeAiTask(SUMMARY_TASK, { transcript }, { signal });
      const text = summary.trim() || OMITTED_NOTICE;
      return limitSummary(text, targetTokens);
    } catch (error) {
      // 主动中止需要上抛；其余失败退化为省略说明，不阻断本轮请求
      if ((error as { name?: string })?.name === "AbortError") throw error;
      console.warn("[简历助手] 历史对话摘要失败，改为省略旧消息:", error);
      return `此前 ${messages.length} 条历史对话已省略。`;
    }
  },
};
