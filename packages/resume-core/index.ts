// 简历公共层只暴露数据契约、格式、脱敏和只读快照，不创建智能体。
export * from "./schema/resumeSchema";
export { RESUME_SCHEMA, findResumeModuleSchema } from "./schema/resumeSchemaRegistry";
export { isResumeMediaField } from "./schema/resumeMedia";
export type { ResumeMediaField } from "./schema/resumeMedia";
export * from "./format/normalizeRichText";
export * from "./format/richTextSanitize";
export * from "./privacy";
export { createResumeSnapshot } from "./snapshot";
export type { ResumeSnapshot, ResumeSnapshotModule, ResumeSnapshotOptions, ResumeSnapshotSource } from "./snapshot";
export { resumeIndustryKnowledge } from "./knowledge";
export type { ResumeKnowledge, ResumeKnowledgeRegistration } from "./knowledge/types";
