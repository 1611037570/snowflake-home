export interface AiTokenUsage {
  inputTokens: number | null; // 本次请求的输入用量，未提供时为空。
  outputTokens: number | null; // 本次请求的输出用量，未提供时为空。
  totalTokens: number | null; // 本次请求总用量，不与输入、输出重复相加。
  cachedTokens: number | null; // 已命中缓存的输入用量，不额外加进总量。
}

export interface AiTokenSummary extends AiTokenUsage {
  partial: (keyof AiTokenUsage)[]; // 哪些用量有请求未提供，此类合计只代表已知消耗。
}

export const createAiTokenUsage = (): AiTokenUsage => ({
  inputTokens: null, // 尚未收到输入用量。
  outputTokens: null, // 尚未收到输出用量。
  totalTokens: null, // 尚未收到总用量。
  cachedTokens: null, // 尚未收到缓存用量。
});

const asObject = (value: unknown): Record<string, unknown> => value && typeof value === "object" ? value as Record<string, unknown> : {};
const asTokens = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;

// 同一请求可能先返回总数再返回明细，统一成快照后覆盖，不能按事件次数累加。
export const readAiTokenUsage = (value: unknown): AiTokenUsage => {
  if (typeof value === "number") return { ...createAiTokenUsage(), totalTokens: asTokens(value) /* 仅提供总量的事件。 */ };
  const source = asObject(value);
  const usage = asObject(source.usage ?? asObject(source.response).usage ?? source);
  const inputTokens = asTokens(usage.input_tokens ?? usage.prompt_tokens);
  const outputTokens = asTokens(usage.output_tokens ?? usage.completion_tokens);
  return {
    inputTokens, // 兼容输入用量的两种字段名称。
    outputTokens, // 兼容输出用量的两种字段名称。
    totalTokens: asTokens(usage.total_tokens), // 先保留明确返回的总量，输入、输出分批到达时在汇总阶段补算。
    cachedTokens: asTokens(asObject(usage.input_tokens_details).cached_tokens ?? asObject(usage.prompt_tokens_details).cached_tokens ?? usage.prompt_cache_hit_tokens), // 缓存命中属于输入子集，只单独展示。
  };
};

// 每个实际请求只结算一份快照，工具轮次与重试分别累计；缺失明细不假装为零。
export const summarizeAiTokens = (requests: AiTokenUsage[]): AiTokenSummary => {
  // 明细可能分批返回，合并完成后才补算缺失总量，显式返回的总量始终优先。
  const normalized = requests.map((usage) => ({
    ...usage,
    totalTokens: usage.totalTokens ?? (usage.inputTokens !== null && usage.outputTokens !== null ? usage.inputTokens + usage.outputTokens : null), // 只在同一次请求的输入、输出均已知时补算。
  }));
  const keys: (keyof AiTokenUsage)[] = ["inputTokens", "outputTokens", "totalTokens", "cachedTokens"];
  const sum = (key: keyof AiTokenUsage): number | null => {
    const provided = normalized.map((usage) => usage[key]).filter((value): value is number => value !== null);
    return provided.length ? provided.reduce((total, value) => total + value, 0) : null;
  };
  return {
    inputTokens: sum("inputTokens"), // 停止或失败也保留已返回的输入用量。
    outputTokens: sum("outputTokens"), // 停止或失败也保留已返回的输出用量。
    totalTokens: sum("totalTokens"), // 总量只累计各请求的总数，不重复叠加明细。
    cachedTokens: sum("cachedTokens"), // 不从未提供缓存信息的请求推断零命中。
    partial: keys.filter((key) => normalized.some((usage) => usage[key] === null)), // 总量和各明细分别标记未知部分，避免把部分消耗误报成完整数值。
  };
};
