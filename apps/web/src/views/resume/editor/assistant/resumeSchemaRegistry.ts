import { allConfig } from "@/stores/modules/resume/config/formConfig";
import { RESUME_VALUE_OPTIONS } from "@/stores/modules/resume/config/resumeOptions";
import { buildResumeSchema, getResumeModuleSchema } from "./resumeSchema";

// 简历业务域负责注入表单配置与字典，引擎解析器不依赖具体业务字段
// 只注入可选值字典：仅渲染用的字典（如省市级联树）不参与字段可选值提取
export const RESUME_SCHEMA = buildResumeSchema(
  Object.entries(allConfig).map(([key, schema]) => ({ key, schema })),
  RESUME_VALUE_OPTIONS,
);

export const findResumeModuleSchema = (moduleKey: string) =>
  getResumeModuleSchema(RESUME_SCHEMA, moduleKey);
