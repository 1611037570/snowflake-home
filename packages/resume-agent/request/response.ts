import { getResumeAiMessage } from "./messages";

// 从对话补全或响应接口的非流式响应中提取正文
export const readResumeAiResponseText = (response: unknown): string => {
  if (typeof response === "string") return response;
  const data = response as any;
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === "string" ? item : item?.text || item?.output_text || ""))
      .join("");
  }
  if (typeof data?.output_text === "string") return data.output_text;
  if (Array.isArray(data?.output)) {
    return data.output
      .flatMap((item: any) => (Array.isArray(item?.content) ? item.content : [item]))
      .map((item: any) => (typeof item === "string" ? item : item?.text || item?.output_text || ""))
      .join("");
  }
  return "";
};

// 检查响应是否被截断，避免把不完整结果当成成功
export const assertResumeAiResponseComplete = (response: unknown) => {
  const data = response as any;
  if (data?.choices?.[0]?.finish_reason === "length" || data?.status === "incomplete") {
    throw new Error(getResumeAiMessage("truncated"));
  }
};
