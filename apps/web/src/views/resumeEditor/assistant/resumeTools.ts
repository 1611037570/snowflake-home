import type { ReactTool } from "@/apis/llm/react";
import { validateResumeEdits, type ResumeWriteOp } from "./resumeEdits";

// 支持更新简历展示语言的语言代码
export const RESUME_LANG_CODES = ["zh", "en", "ja", "ko", "fr", "de", "es", "ru"];

// 简历工具的运行时上下文，由调用方注入，保持工具本身无副作用依赖
export interface ResumeToolContext {
  // 读取当前简历数据（跟随 AI 助手当前选中的模块）
  getResumeData: () => unknown;
  // 数组型模块新增一条空记录并同步表单配置，返回新记录下标（失败返回 -1）
  addDataRecord?: (moduleKey: string) => number;
  // 删除数组型模块记录并同步表单配置
  removeDataRecord?: (moduleKey: string, index: number) => boolean;
  // 移动数组型模块记录并同步表单配置
  moveDataRecord?: (moduleKey: string, from: number, to: number) => boolean;
  // 修改模块级 data 字段（如自定义模块 title）
  updateModuleField?: (moduleKey: string, field: string, value: unknown) => boolean;
  // 修改记录字段
  updateRecordField?: (
    moduleKey: string,
    index: number,
    field: string,
    value: unknown,
  ) => boolean;
  // 更新简历展示语言（翻译完成后同步标题等界面文案语言）
  updateLanguage?: (language: string) => boolean;
}

// 创建简历域工具集：读取数据 + 生成简历修改，由简历调用方组装后传给 chat
export function createResumeTools(ctx: ResumeToolContext): ReactTool[] {
  return [
    {
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
    },
    {
      name: "propose_resume_edits",
      description:
        "根据分析结果生成简历修改，回复完成后直接写入简历数据（用户可撤回）。通过 operations 语义化描述写操作：updateModule 修改模块级 data 字段（如自定义模块 title）；updateRecord 修改记录字段；addRecord 新增记录；deleteRecord 删除记录；moveRecord 调整记录顺序。提交前会做结构与格式校验，校验失败不写入并返回 errors，请按 errors 修正后重新提交。operations 必须为标准 JSON，参数只使用普通字符，禁止输出 HTML 实体（如 &#x20;、&nbsp;、&quot; 等）。",
      parameters: {
        type: "object",
        properties: {
          operations: {
            type: "array",
            description:
              "写操作列表，一次调用会合并为一次写入；操作目标必须是 read_resume_data 返回的已有模块与字段；参数为标准 JSON，禁止输出 HTML 实体",
            items: {
              type: "object",
              properties: {
                op: {
                  type: "string",
                  description:
                    "操作类型：updateModule 改模块字段；updateRecord 改记录；addRecord 新增；deleteRecord 删除；moveRecord 排序",
                },
                module: {
                  type: "string",
                  description: "模块 key，如 user/work/project/education/skill/account",
                },
                index: {
                  type: "number",
                  description: "记录下标（从 0 开始），updateRecord/deleteRecord 使用",
                },
                field: {
                  type: "string",
                  description: "要修改的字段名，来自 read_resume_data 返回的数据，updateModule/updateRecord 使用",
                },
                value: {
                  description: "修改后的值，格式遵守简历数据规范，updateModule/updateRecord 使用",
                },
                record: {
                  type: "object",
                  description: "新增记录的内容，键为字段名、值为实际写入值，addRecord 使用",
                },
                from: {
                  type: "number",
                  description: "原记录下标（从 0 开始），moveRecord 使用",
                },
                to: {
                  type: "number",
                  description: "目标记录下标（从 0 开始），moveRecord 使用",
                },
              },
              required: ["op", "module"],
            },
          },
        },
        required: ["operations"],
      },
      execute: (args: any) => {
        const operations: ResumeWriteOp[] = Array.isArray(args?.operations) ? args.operations : [];
        // 先做结构与格式校验，校验失败不产生任何写操作副作用
        const errors = validateResumeEdits(operations, ctx.getResumeData() as any);
        if (errors.length) {
          console.log("[ReAct] propose_resume_edits 校验未通过:", errors);
          return { applied: false, changed: [], added: [], errors };
        }
        const added: Array<{ module: string; index: number }> = [];
        let changedData = false;
        operations.forEach((op) => {
          if (!op) return;
          if (op.op === "updateModule") {
            if (ctx.updateModuleField?.(op.module, op.field, op.value)) changedData = true;
            return;
          }
          if (op.op === "updateRecord") {
            if (ctx.updateRecordField?.(op.module, op.index, op.field, op.value)) {
              changedData = true;
            }
            return;
          }
          if (op.op === "addRecord") {
            const index = ctx.addDataRecord?.(op.module) ?? -1;
            if (index < 0) return;
            changedData = true;
            added.push({ module: op.module, index });
            if (op.record && typeof op.record === "object") {
              Object.entries(op.record).forEach(([field, value]) => {
                if (ctx.updateRecordField?.(op.module, index, field, value)) {
                  changedData = true;
                }
              });
            }
            return;
          }
          if (op.op === "deleteRecord") {
            if (ctx.removeDataRecord?.(op.module, op.index)) changedData = true;
            return;
          }
          if (op.op === "moveRecord") {
            if (ctx.moveDataRecord?.(op.module, op.from, op.to)) changedData = true;
          }
        });
        return {
          applied: changedData,
          changed: [],
          added,
          errors: [],
        };
      },
    },
    {
      name: "update_resume_language",
      description:
        "更新简历的展示语言（控制模块标题、页脚等界面文案语言），翻译简历内容后调用，language 使用规范语言代码",
      parameters: {
        type: "object",
        properties: {
          language: {
            type: "string",
            description:
              "规范语言代码：zh 中文 / en 英语 / ja 日语 / ko 韩语 / fr 法语 / de 德语 / es 西班牙语 / ru 俄语",
          },
        },
        required: ["language"],
      },
      execute: (args: any) => {
        const language = args?.language;
        const updated =
          RESUME_LANG_CODES.includes(language) && (ctx.updateLanguage?.(language) ?? false);
        return updated ? { updated: true } : { updated: false };
      },
    },
  ];
}
