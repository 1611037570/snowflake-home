import type { ReactTool } from "@/apis/llm/react";
import type { ResumeToolContext } from "./tool_types";

// 创建读取简历数据工具
export const createReadResumeDataTool = (ctx: ResumeToolContext): ReactTool => ({
  name: "read_resume_data",
  description:
    "读取当前简历数据：跟随用户在 AI 助手里的模块选择，未选择模块时读取整份简历；仅返回各模块 data，不含 collapsed/hidden 等 UI 状态。",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: () => {
    const data = ctx.getResumeData();
    return { data };
  },
});
