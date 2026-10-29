// 简历智能体只注册自己的模型与文案，公共数据契约从简历公共包独立注册。
export {
  configureResumeAiModelProvider,
} from "./request/client";
export type { ResumeAiModelProvider } from "./request/client";
export { configureResumeAiMessageProvider } from "./request/messages";
export type {
  ResumeAiMessageKey,
  ResumeAiMessageProvider,
} from "./request/messages";
