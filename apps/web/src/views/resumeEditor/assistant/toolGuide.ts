import type { ReactTool } from "@/apis/llm/react";

// 工具纠错指南：工具名调用失败时随观察结果回传，列出可用工具准确名称，引导模型重新调用
export const buildToolGuide = (tools: ReactTool[]): string => {
  if (!tools.length) return "当前没有可用工具。";
  const lines = tools.map(
    (tool) => `- ${tool.name}：${tool.description.split("。")[0]}。`,
  );
  return `可用工具如下，请使用其中的准确名称重新调用，不要臆造或改写工具名：\n${lines.join("\n")}`;
};
