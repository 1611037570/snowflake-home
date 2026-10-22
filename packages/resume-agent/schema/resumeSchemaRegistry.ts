import {
  getResumeModuleSchema,
  resolveResumeModuleSchema,
} from "./resumeSchema";
import type { ResumeModuleSchema } from "./resumeSchema";

// 保持数组引用稳定，技能和导入流程始终读取宿主最近注册的字段契约。
export const RESUME_SCHEMA: ResumeModuleSchema[] = [];

// 注册由宿主表单配置生成的字段契约，领域逻辑不直接解析界面 DSL。
export const configureResumeSchema = (schema: ResumeModuleSchema[]) => {
  RESUME_SCHEMA.splice(0, RESUME_SCHEMA.length, ...schema);
};

export const findResumeModuleSchema = (moduleKey: string, data?: unknown, layout?: string) =>
  resolveResumeModuleSchema(getResumeModuleSchema(RESUME_SCHEMA, moduleKey), data, layout);
