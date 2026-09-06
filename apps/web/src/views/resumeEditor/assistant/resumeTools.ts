import type { ReactTool } from "@/apis/llm/react";
import { buildDiffPatch, validateResumeEdits, type ResumeWriteOp } from "./resumeEdits";

// 简历工具的运行时上下文，由调用方注入，保持工具本身无副作用依赖
export interface ResumeToolContext {
  // 读取当前简历数据，可选按模块 key 裁剪
  getResumeData: (moduleKey?: string) => unknown;
  // 数组型模块新增一条空记录并同步表单配置，返回新记录下标（失败返回 -1）
  addDataRecord?: (moduleKey: string) => number;
  // 将 AI 提议的补丁写入预览草稿（仍由用户确认，不直接修改简历）
  applyDiff: (patch: Record<string, any>) => string[];
}

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
        "根据分析结果生成简历修改草稿，写入预览草稿供用户确认，不会直接改动简历。通过 operations 语义化描述写操作：update 修改已有字段（对象型模块指定 module+field，数组型模块再加 index）；add 为数组型模块新增记录并携带 record 内容。提交前会做结构与格式校验，校验失败不写入草稿并返回 errors，请按 errors 修正后重新提交。",
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
                  description: "操作类型：update 修改已有字段，add 为数组型模块新增记录",
                },
                module: {
                  type: "string",
                  description: "模块 key，如 user/work/project/education/skill/account",
                },
                index: {
                  type: "number",
                  description: "数组型模块的记录下标（从 0 开始），update 使用，对象型模块不填",
                },
                field: {
                  type: "string",
                  description: "要修改的字段名，来自 read_resume_data 返回的数据，update 使用",
                },
                value: {
                  description: "修改后的值，格式遵守简历数据编写规范，update 使用",
                },
                record: {
                  type: "object",
                  description: "新增记录的内容，键为字段名、值为草稿值，add 使用",
                },
              },
              required: ["op", "module"],
            },
          },
        },
        required: ["operations"],
      },
      execute: (args: any) => {
        const operations: ResumeWriteOp[] = Array.isArray(args?.operations)
          ? args.operations
          : [];
        // 先做结构与格式校验，校验失败不产生任何写操作副作用
        const errors = validateResumeEdits(operations, ctx.getResumeData() as any);
        if (errors.length) {
          console.log("[ReAct] propose_resume_edits 校验未通过:", errors);
          return { applied: false, changed: [], added: [], errors };
        }
        // 先执行 add 新增记录，再把新增内容与 update 合并为同一份草稿
        const updateOps: ResumeWriteOp[] = [];
        const added: Array<{ module: string; index: number }> = [];
        operations.forEach((op) => {
          if (!op) return;
          if (op.op === "update") {
            updateOps.push(op);
            return;
          }
          if (op.op === "add") {
            const index = ctx.addDataRecord?.(op.module) ?? -1;
            if (index < 0) return;
            added.push({ module: op.module, index });
            if (op.record && typeof op.record === "object") {
              Object.entries(op.record).forEach(([field, value]) => {
                updateOps.push({
                  op: "update",
                  module: op.module,
                  index,
                  field,
                  value,
                });
              });
            }
          }
        });
        // 纯新增且无内容时不调用 applyDiff，避免误清空已有草稿
        if (!updateOps.length) {
          return { applied: added.length > 0, changed: [], added, errors: [] };
        }
        const changed = ctx.applyDiff(buildDiffPatch(updateOps));
        // 打印 diff 结果，便于确认工具是否被调用以及实际写入的字段
        console.log("[ReAct] propose_resume_edits 写入草稿字段:", changed);
        return { applied: true, changed, added, errors: [] };
      },
    },
  ];
}
