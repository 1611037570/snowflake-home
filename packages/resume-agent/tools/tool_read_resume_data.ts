import type { ResumeAgentTool } from "../runtime/types";
import { defineTool } from "./defineTool";
import type { ResumeToolContext } from "./tool_types";

// 创建读取简历数据工具
export const createReadResumeDataTool = (ctx: ResumeToolContext): ResumeAgentTool =>
  defineTool({
  name: "read_resume_data",
  description:
    "读取当前简历数据：跟随用户在 AI 助手里的模块选择，未选择模块时读取整份简历；返回模块 title 与 data，不含 collapsed/hidden 等其他 UI 状态，模块操作仍使用稳定 key。",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: () => {
    const data = ctx.getResumeData();
    return { data };
  },
  // 该工具只读取当前资料。
  effect: "read",
  // 返回数据对象即表示本次授权范围已经完成读取。
  evaluate: (result) => {
    const data = result && typeof result === "object" ? (result as { data?: unknown }).data : undefined;
    const success = Boolean(data && typeof data === "object");
    return {
      status: success ? "success" : "failed",
      summary: success ? "已读取当前简历数据" : "未能读取当前简历数据",
      // 记录本次读取涉及的模块，供读取范围覆盖校验比对
      facts: success ? Object.keys(data as Record<string, unknown>).map((key) => `module:${key}`) : [],
    };
  },
});
