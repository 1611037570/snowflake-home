import { getResumeAiMessage } from "./messages";

// 传输层失败特征：只有这类错误才改写为用户可读文案，业务与校验错误保留原文
const NETWORK_PATTERN = /failed to fetch|networkerror|network request failed|econnrefused|econnreset|etimedout/i;
const TIMEOUT_PATTERN = /timeout|timed out|超时/i;

// 把请求异常转换为可展示文案：分类传输层失败，其余保留具体原因
export const describeResumeAiError = (error: unknown): string => {
  const candidate = error as { name?: string; message?: string; status?: number } | undefined;
  if (candidate?.name === "AbortError") return getResumeAiMessage("aborted");
  const status = typeof candidate?.status === "number" ? candidate.status : undefined;
  if (status === 429) return getResumeAiMessage("rateLimited");
  if (status && status >= 500) return getResumeAiMessage("serverError");
  const message = typeof candidate?.message === "string" ? candidate.message.trim() : "";
  if (TIMEOUT_PATTERN.test(message)) return getResumeAiMessage("timeout");
  if (NETWORK_PATTERN.test(message)) return getResumeAiMessage("network");
  // 领域错误自带可核对的具体原因，不能被通用文案覆盖
  return message || getResumeAiMessage("unknown");
};
