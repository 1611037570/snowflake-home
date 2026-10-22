// 宿主接线出口：应用启动时一次性注册模型选择、界面文案、字段契约与媒体声明。
// 读取侧（查询模型、查询字段契约）仍从包根入口引入，避免接线与使用混在同一出口。
export {
  configureResumeAiModelProvider,
} from "./request/client";
export type { ResumeAiModelProvider } from "./request/client";
export { configureResumeAiMessageProvider } from "./request/messages";
export type {
  ResumeAiMessageKey,
  ResumeAiMessageProvider,
} from "./request/messages";
export { configureResumeSchema } from "./schema/resumeSchemaRegistry";
export { configureResumeMediaFields } from "./schema/resumeMedia";
export type { ResumeMediaField } from "./schema/resumeMedia";
