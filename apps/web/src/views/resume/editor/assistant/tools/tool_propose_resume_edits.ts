import type { ReactTool } from "@/apis/llm/react";
import type { ResumeWriteOp } from "@/stores/modules/resume/resumeOperations";
import { validateResumeEdits } from "../resumeEdits";
import { PROPOSE_RESUME_EDITS_RULE, TOOL_ARGUMENT_RULE } from "../skills/prompt_tool_rules";
import type { ResumeToolContext } from "./tool_types";

// 创建简历修改工具：校验后立即写入简历数据
export const createProposeResumeEditsTool = (ctx: ResumeToolContext): ReactTool => ({
  name: "propose_resume_edits",
  description: `${TOOL_ARGUMENT_RULE}\n\n${PROPOSE_RESUME_EDITS_RULE}\n\n根据分析结果生成简历修改，调用后立即写入简历数据（用户可撤回）。通过 operations 语义化描述写操作：updateModule 修改模块级 data 字段；updateModuleTitle 修改模块展示标题；updateRecord 修改记录字段；addRecord 新增记录；deleteRecord 删除记录；moveRecord 调整记录顺序。提交前会做结构与格式校验，校验失败不写入并返回 errors，请按 errors 修正后重新提交。`,
  parameters: {
    type: "object",
    properties: {
      operations: {
        type: "array",
        description:
          "写操作列表，一次调用会合并为一次写入；模块必须来自 read_resume_data，字段必须是当前已有字段或《简历数据规范》声明的可添加字段；参数必须是标准 JSON",
        items: {
          type: "object",
          properties: {
            op: {
              type: "string",
              description:
                "操作类型：updateModule 改模块字段；updateModuleTitle 改模块标题；updateRecord 改记录；addRecord 新增；deleteRecord 删除；moveRecord 排序",
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
              description:
                "要修改的字段名，来自 read_resume_data 或《简历数据规范》中声明的可添加字段，updateModule/updateRecord 使用",
            },
            value: {
              description: "修改后的值，格式遵守简历数据规范，updateModule/updateRecord 使用",
            },
            title: {
              type: "string",
              description: "模块展示标题，updateModuleTitle 使用；module 仍必须传稳定 key",
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
    // 工具只提交完整操作列表，具体执行语义由简历领域统一处理
    const result = ctx.applyResumeOperations(operations);
    return {
      ...result,
      errors: result.failed.map((index) => `第 ${index + 1} 条操作未执行成功`),
    };
  },
});
