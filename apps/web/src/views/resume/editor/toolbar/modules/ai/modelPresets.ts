/** 模型预设只辅助填写，不代表当前密钥拥有调用权限。 */
export interface ModelPreset {
  /** 服务商标识，用于筛选添加弹窗中的预设。 */
  provider: string;
  /** 接口请求使用的完整模型 ID。 */
  model: string;
  /** 预设名称，用于展示和默认别名。 */
  name: string;
}

// 仅提供添加时的常用型号，用户添加后的配置由用户自行维护。
export const MODEL_PRESETS: ModelPreset[] = [
  {
    provider: "openai", // OpenAI 官方与兼容服务。
    model: "gpt-5.4", // 官方模型 ID。
    name: "GPT-5.4", // 默认展示名称。
  },
  {
    provider: "openai", // OpenAI 官方与兼容服务。
    model: "gpt-5.4-mini", // 官方模型 ID。
    name: "GPT-5.4 Mini", // 默认展示名称。
  },
  {
    provider: "ark", // 豆包与火山方舟。
    model: "doubao-seed-2-1-pro-260915", // 官方模型 ID，用户也可填写自己的接入点。
    name: "Doubao Seed 2.1 Pro", // 默认展示名称。
  },
  {
    provider: "gemini", // Google Gemini。
    model: "gemini-3.8-flash", // 官方模型 ID。
    name: "Gemini 3.8 Flash", // 默认展示名称。
  },
  {
    provider: "gemini", // Google Gemini。
    model: "gemini-4-argon", // 官方模型 ID。
    name: "Gemini 4 Argon", // 默认展示名称。
  },
  {
    provider: "deepseek", // DeepSeek 官方服务。
    model: "deepseek-flash", // 官方当前 Flash 调用名。
    name: "DeepSeek Flash", // 默认展示名称。
  },
  {
    provider: "deepseek", // DeepSeek 官方服务。
    model: "deepseek-v4-pro", // 官方模型 ID。
    name: "DeepSeek V4 Pro", // 默认展示名称。
  },
  {
    provider: "claude", // Anthropic Claude。
    model: "claude-sonnet-5-5", // 官方模型 ID。
    name: "Claude Sonnet 5.5", // 默认展示名称。
  },
  {
    provider: "claude", // Anthropic Claude。
    model: "claude-haiku-5-5", // 官方模型 ID。
    name: "Claude Haiku 5.5", // 默认展示名称。
  },
  {
    provider: "qwen", // 阿里云百炼千问。
    model: "qwen3.7-plus", // 官方模型 ID。
    name: "千问 3.7 Plus", // 默认展示名称。
  },
  {
    provider: "qwen", // 阿里云百炼千问。
    model: "qwen3.8-flash", // 官方模型 ID。
    name: "千问 3.8 Flash", // 默认展示名称。
  },
];
