// 宿主一次性注册公共数据契约，简历与面试均读取同一份字段声明。
export { configureResumeSchema } from "./schema/resumeSchemaRegistry";
export { configureResumeMediaFields } from "./schema/resumeMedia";
export type { ResumeMediaField } from "./schema/resumeMedia";
