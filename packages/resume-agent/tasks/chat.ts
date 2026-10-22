import type { ResumeAiMessage, ResumeAiTask } from "../request";

// 通用会话输入。
export type ResumeChatInput = {
  messages: ResumeAiMessage[]; // 本轮发送的对话消息。
};

const buildMessages = ({ messages }: ResumeChatInput) => messages;

// 普通会话任务：统一通过小舟模型流式响应。
export const GENERAL_CHAT_TASK: ResumeAiTask<ResumeChatInput> = {
  agent: "xiaoZhou",
  stream: true,
  retryCount: 0,
  extraOptions: { thinking: { type: "disabled" } },
  buildMessages,
};

// 简历会话任务：沿用原有 JSON 响应处理方式。
export const RESUME_CHAT_TASK: ResumeAiTask<ResumeChatInput> = {
  ...GENERAL_CHAT_TASK,
  json: true,
};
