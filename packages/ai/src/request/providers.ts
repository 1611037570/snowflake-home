// 兼容接口的服务商参数适配集中在基础包，所有宿主和业务入口共用。
export function prepareProviderOptions(
  provider: string,
  protocol: string,
  options: Record<string, any>,
) {
  const result = { ...options };
  if (protocol !== "chatCompletions") return result;

  const thinking = result.thinking;
  if (thinking && ["gemini", "qwen", "claude"].includes(provider)) {
    // 通用思考开关不是这些兼容接口的通用字段，转换后不再直接透传。
    if (provider === "gemini") {
      delete result.thinking;
      // 部分 Gemini 模型不能关闭思考，快速模式使用低思考量。
      result.reasoning_effort ??= thinking.type === "enabled" ? "high" : "low";
    } else if (provider === "qwen") {
      delete result.thinking;
      result.enable_thinking ??= thinking.type === "enabled";
    } else if (Object.keys(thinking).length === 1) {
      // Claude 的简化兼容入口沿用模型默认思考策略；完整原生参数仍保留。
      delete result.thinking;
    }
  }

  // Claude 部分模型不接受强制工具调用，工具仍由模型自主选择并正常回填结果。
  if (provider === "claude" && result.tools?.length && result.tool_choice !== "none") {
    result.tool_choice = "auto";
  }
  return result;
}

// 仅官方 Claude 浏览器直连需要此请求头，自定义兼容服务不额外附加。
export function getProviderHeaders(provider: string, url: string): Record<string, string> {
  if (provider === "claude" && typeof window !== "undefined" && new URL(url).hostname === "api.anthropic.com") {
    return {
      "anthropic-dangerous-direct-browser-access": "true", // 官方 SDK 使用的浏览器访问声明。
    };
  }
  return {};
}
