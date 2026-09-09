import type { ReactTool } from "@/apis/llm/react";
import { createProposeResumeEditsTool } from "./tool_propose_resume_edits";
import { createReadResumeDataTool } from "./tool_read_resume_data";
import { createUpdateResumeLanguageTool, RESUME_LANG_CODES } from "./tool_update_resume_language";
import type { ResumeToolContext } from "./tool_types";

// 统一组装简历工具，具体工具实现按文件独立维护
export const createResumeTools = (ctx: ResumeToolContext): ReactTool[] => [
  createReadResumeDataTool(ctx),
  createProposeResumeEditsTool(ctx),
  createUpdateResumeLanguageTool(ctx),
];

export { RESUME_LANG_CODES };
export type { ResumeToolContext } from "./tool_types";
