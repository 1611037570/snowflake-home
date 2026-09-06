import type { ReactTool } from "@/apis/llm/react";

// 简历工具的运行时上下文，由调用方注入，保持工具本身无副作用依赖
export interface ResumeToolContext {
  // 读取当前简历数据，可选按模块 key 裁剪
  getResumeData: (moduleKey?: string) => unknown;
  // 将 AI 提议的补丁写入预览草稿（仍由用户确认，不直接修改简历）
  applyDiff: (patch: Record<string, any>) => string[];
}

// 语义化写操作：明确到模块、记录与字段，避免让模型自行拼装整棵 diff
export type ResumeWriteOp = {
  op: "update"; // 操作类型，当前仅支持修改已有字段
  module: string; // 模块 key，如 user/work/project/education/skill/account
  index?: number; // 数组型模块的记录下标（从 0 开始），对象型模块不填
  field: string; // 要修改的字段名
  value: unknown; // 修改后的值
};

// 把语义化写操作合并为预览层 diff 所需的树形 patch
const buildDiffPatch = (operations: ResumeWriteOp[]): Record<string, any> => {
  const patch: Record<string, any> = {};
  operations.forEach((op) => {
    if (!op || op.op !== "update") return;
    const modulePatch = patch[op.module] ?? { data: op.index == null ? {} : [] };
    patch[op.module] = modulePatch;
    if (op.index == null) {
      modulePatch.data[op.field] = op.value;
    } else {
      const record = (modulePatch.data[op.index] ??= {});
      record[op.field] = op.value;
    }
  });
  return patch;
};

// 创建简历域工具集：读取数据 + 生成修改草稿，由简历调用方组装后传给 chat
export function createResumeTools(ctx: ResumeToolContext): ReactTool[] {
  return [
    {
      name: "read_resume_data",
      description:
        "读取当前简历数据（仅各模块 data，不含 collapsed/hidden 等 UI 状态），可传入 moduleKey 读取指定模块，不传则读取整份简历。",
      parameters: {
        type: "object",
        properties: {
          moduleKey: {
            type: "string",
            description: "模块 key，如 user/work/project/education/skill/account，可选，不传读取整份简历",
          },
        },
      },
      execute: (args: any) => {
        const data = ctx.getResumeData(args?.moduleKey);
        return { data };
      },
    },
    {
      name: "propose_resume_edits",
      description:
        "根据分析结果生成简历修改草稿，写入预览草稿供用户确认，不会直接改动简历。通过 operations 语义化描述写操作：update 表示修改已有字段，对象型模块指定 module+field，数组型模块再加 index 定位记录。",
      parameters: {
        type: "object",
        properties: {
          operations: {
            type: "array",
            description:
              "写操作列表，一次调用会合并为一份草稿；操作目标必须是 read_resume_data 返回的已有模块与字段",
            items: {
              type: "object",
              properties: {
                op: {
                  type: "string",
                  description: "操作类型，当前仅支持 update",
                },
                module: {
                  type: "string",
                  description: "模块 key，如 user/work/project/education/skill/account",
                },
                index: {
                  type: "number",
                  description: "数组型模块的记录下标（从 0 开始），对象型模块不填",
                },
                field: {
                  type: "string",
                  description: "要修改的字段名，来自 read_resume_data 返回的数据",
                },
                value: {
                  description: "修改后的值，格式遵守简历数据编写规范",
                },
              },
              required: ["op", "module", "field", "value"],
            },
          },
        },
        required: ["operations"],
      },
      execute: (args: any) => {
        const operations: ResumeWriteOp[] = Array.isArray(args?.operations)
          ? args.operations
          : [];
        // 无有效操作时保持草稿原样，不做清空与写入
        if (!operations.length) return { applied: false, changed: [] };
        const changed = ctx.applyDiff(buildDiffPatch(operations));
        // 打印 diff 结果，便于确认工具是否被调用以及实际写入的字段
        console.log("[ReAct] propose_resume_edits 写入草稿字段:", changed);
        return { applied: true, changed };
      },
    },
  ];
}
