import { defineComponent, h, type Component } from "vue";
import OpenaiIcon from "@iconify-vue/simple-icons/openai";
import DeepseekIcon from "@iconify-vue/logos/deepseek-icon";
import GeminiIcon from "@iconify-vue/logos/google-gemini-icon";
import ClaudeIcon from "@iconify-vue/logos/claude-icon";
import QwenIcon from "@iconify-vue/logos/qwen-icon";
import doubaoUrl from "./icons/doubao.svg";
import volcengineUrl from "./icons/volcengine.svg";

// 品牌原图保持原色，以本地组件接入 SfIcon，避免依赖在线图标服务。
function createBrandIcon(url: string) {
  return defineComponent({
    // 图片组件沿用 SfIcon 提供的尺寸和样式。
    setup: () => () => h("img", {
      src: url, // 随项目打包的品牌图标地址。
      alt: "", // 相邻模型或服务商名称已提供文字说明。
    }),
  });
}

export const AI_BRAND_ICONS: Record<string, Component> = {
  "simple-icons:openai": OpenaiIcon, // OpenAI 标识使用当前文字色以适配明暗主题。
  "logos:deepseek-icon": DeepseekIcon, // DeepSeek 彩色品牌标识。
  "logos:google-gemini-icon": GeminiIcon, // Gemini 彩色品牌标识。
  "logos:claude-icon": ClaudeIcon, // Claude 品牌标识。
  "logos:qwen-icon": QwenIcon, // 千问彩色品牌标识。
  "local:doubao": createBrandIcon(doubaoUrl), // 豆包彩色品牌标识。
  "local:volcengine": createBrandIcon(volcengineUrl), // 火山引擎彩色品牌标识。
};

const providerIcons: Record<string, string> = {
  openai: "simple-icons:openai", // OpenAI 兼容接口默认使用 OpenAI 标识。
  deepseek: "logos:deepseek-icon", // DeepSeek 服务商标识。
  ark: "local:doubao", // 豆包预设继续使用 Ark 服务商标识。
  gemini: "logos:google-gemini-icon", // Gemini 服务商标识。
  claude: "logos:claude-icon", // Claude 服务商标识。
  qwen: "logos:qwen-icon", // 千问服务商标识。
  snowflake: "fa6-solid:snowflake", // 内置雪花服务标识。
};

// 只影响品牌展示；连接协议、服务商配置和角色绑定仍使用原有数据。
export function getProviderIcon(provider: string, builtin = false, model = "") {
  if (builtin) return "fa6-solid:snowflake";
  if (/^doubao(?:[-/]|$)/i.test(model)) return "local:doubao";
  return providerIcons[provider] || "lucide:sparkles";
}
