import { allConfig } from "@/stores/modules/resume/formConfig";
import { RESUME_OPTIONS } from "@/stores/modules/resume/resumeOptions";
import { buildResumeSchema, getResumeModuleSchema } from "./resumeSchema";

// 简历业务域负责注入表单配置与字典，引擎解析器不依赖具体业务字段
export const RESUME_SCHEMA = buildResumeSchema(
  Object.entries(allConfig).map(([key, schema]) => ({ key, schema })),
  RESUME_OPTIONS,
);

export const findResumeModuleSchema = (moduleKey: string) =>
  getResumeModuleSchema(RESUME_SCHEMA, moduleKey);
