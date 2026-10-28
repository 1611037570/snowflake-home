import { env } from "../env";
// 服务商展示名映射（用于无别名且无模型名时的兜底展示）
export const PROVIDER_NAMES: Record<string, string> = {
  snowflake: "雪花服务",
  openai: "OpenAI / 兼容服务", // 官方接口及兼容服务入口。
  ark: "豆包 / 火山方舟", // 保留既有 Ark 标识以兼容已保存配置。
  deepseek: "DeepSeek",
  gemini: "Gemini", // Google Gemini 兼容接口。
  claude: "Claude", // Claude 官方兼容接口。
  qwen: "千问 Qwen", // 阿里云百炼兼容接口。
};

// 内置雪花服务配置
export const snowflake = {
  baseUrl: "https://api.deepseek.com/chat/completions",
  provider: "openai",
  apiKey: env.aiApiKey, // 从本地环境读取密钥，保留当前前端直连方式
  model: "deepseek-v4-flash",
  protocol: "chatCompletions" as const,
};
