// 服务商展示名映射（用于无别名且无模型名时的兜底展示）
export const PROVIDER_NAMES: Record<string, string> = {
  snowflake: "雪花服务",
  openai: "OpenAI",
  ark: "火山方舟 Ark",
  deepseek: "DeepSeek",
};

// 内置雪花服务配置
export const snowflake = {
  baseUrl: "https://api.deepseek.com/chat/completions",
  provider: "openai",
  apiKey: "sk-b296024c9bf14e189ef53d07571b56f0",
  model: "deepseek-v4-flash",
};
