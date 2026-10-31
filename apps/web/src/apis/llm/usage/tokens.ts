export interface AiTokenUsage {
  inputTokens: number | null; // 本次请求的输入用量，未提供时为空
  outputTokens: number | null; // 本次请求的输出用量，未提供时为空
  totalTokens: number | null; // 本次请求总用量，不与输入、输出重复相加
}

export const createAiTokenUsage = (): AiTokenUsage => ({
  inputTokens: null, // 尚未收到输入用量
  outputTokens: null, // 尚未收到输出用量
  totalTokens: null, // 尚未收到总用量
});

const asObject = (value: unknown): Record<string, unknown> => value && typeof value === "object" ? value as Record<string, unknown> : {};
const asTokens = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;

// 同一请求可能先返回总数再返回明细，统一成快照后覆盖，不能按事件次数累加。
export const readAiTokenUsage = (value: unknown): AiTokenUsage => {
  if (typeof value === "number") return { ...createAiTokenUsage(), totalTokens: asTokens(value) /* 仅提供总量的事件 */ };
  const source = asObject(value);
  const usage = asObject(source.usage ?? asObject(source.response).usage ?? source);
  return {
    inputTokens: asTokens(usage.input_tokens ?? usage.prompt_tokens), // 兼容输入用量的两种字段名称
    outputTokens: asTokens(usage.output_tokens ?? usage.completion_tokens), // 兼容输出用量的两种字段名称
    totalTokens: asTokens(usage.total_tokens), // 只认明确返回的总量，缺省时由调用方补算
  };
};

// 单次请求的已知总量：服务商只返回明细时按输入加输出补算，缺失的一律不计。
export const resolveAiTokenTotal = (usage: AiTokenUsage) =>
  usage.totalTokens
  ?? (usage.inputTokens !== null && usage.outputTokens !== null ? usage.inputTokens + usage.outputTokens : 0);
