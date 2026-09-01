import type { ReactTool } from "./types";

// 工具注册表：按名称管理工具，执行器据此查找并调用
export class ToolRegistry {
  private tools = new Map<string, ReactTool>();

  register(tool: ReactTool) {
    this.tools.set(tool.name, tool);
  }

  get(name: string) {
    return this.tools.get(name);
  }
}

// 简历工具的运行时上下文，由调用方注入，保持工具本身无副作用依赖
export interface ResumeToolContext {
  // 读取当前简历数据，可选按模块 key 裁剪
  getResumeData: (moduleKey?: string) => unknown;
  // 将 AI 提议的补丁写入预览草稿（仍由用户确认，不直接修改简历）
  applyDiff: (patch: Record<string, any>) => void;
}

// 创建首期简历工具集：读取数据 + 生成修改草稿
export function createResumeTools(ctx: ResumeToolContext): ReactTool[] {
  return [
    {
      name: "read_resume_data",
      description: "读取当前简历数据，可传入 moduleKey 读取指定模块，不传则读取整份简历。",
      parameters: {
        type: "object",
        properties: {
          moduleKey: {
            type: "string",
            description: "模块 key，如 user/work/project/education/skill/account，可选",
          },
        },
      },
      execute: (args: any) => {
        const data = ctx.getResumeData(args?.moduleKey);
        return { data };
      },
    },
    {
      name: "propose_resume_diff",
      description:
        "根据分析结果生成简历修改草稿，写入预览草稿供用户确认，不会直接改动简历。",
      parameters: {
        type: "object",
        properties: {
          patch: {
            type: "object",
            description: "需要修改的简历字段补丁，结构与简历数据一致，仅包含变更字段",
          },
        },
        required: ["patch"],
      },
      execute: (args: any) => {
        ctx.applyDiff(args?.patch);
        return { applied: true };
      },
    },
  ];
}
