import type { ResumeWriteOp } from "@/stores/modules/resume/resumeOperations";
import { RESUME_AGENT_FACTS, type ResumeAgentTool } from "../runtime/types";
import { getResumeEditValidationIssues, normalizeResumeEdits } from "./resumeEdits";
import { PROPOSE_RESUME_EDITS_RULE, TOOL_ARGUMENT_RULE } from "./promptRules";
import type { ResumeToolContext } from "./tool_types";

// 创建简历修改工具：校验后立即写入简历数据
export const createProposeResumeEditsTool = (ctx: ResumeToolContext): ResumeAgentTool => ({
  name: "propose_resume_edits",
  description: `${TOOL_ARGUMENT_RULE}\n\n${PROPOSE_RESUME_EDITS_RULE}\n\n根据分析结果生成简历修改，调用后立即写入简历数据（用户可撤回）。通过 operations 语义化描述写操作：updateModule 修改模块级 data 字段；updateModuleTitle 修改模块展示标题；updateRecord 修改记录字段；addRecord 新增记录；deleteRecord 删除记录；moveRecord 调整记录顺序。提交前会做结构与格式校验；validationIssues 与 executionIssues 通过 operationIndex 标明失败操作，只修正对应项后重新提交。`,
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
    // 清除本轮先前写入凭据，结构校验或执行失败均不得继续切换语言
    ctx.resetSuccessfulWrite?.();
    const submittedOperations: ResumeWriteOp[] = Array.isArray(args?.operations) ? args.operations : [];
    const dataView = ctx.getResumeData() as any;
    // 富文本字段统一转换为编辑器 HTML，避免 Markdown 或纯文本直接落库
    const operations = normalizeResumeEdits(submittedOperations, dataView);
    // 空操作或缺失参数不能被当成合法写入结果
    const validationIssues = operations.length
      ? getResumeEditValidationIssues(operations, dataView)
      : [{ operationIndex: null, code: "INVALID_OPERATION", message: "operations 必须是非空的写操作数组" }];
    if (validationIssues.length) {
      const errors = validationIssues.map((issue) => issue.message);
      console.log("[ReAct] propose_resume_edits 校验未通过:", errors);
      return {
        applied: false,
        changed: [],
        added: [],
        errors,
        // 字段与格式校验失败项
        validationIssues,
        // 领域执行失败项，校验失败时为空
        executionIssues: [],
      };
    }
    // 工具只提交完整操作列表，具体执行语义由简历领域统一处理
    const result = ctx.applyResumeOperations(operations);
    const executionIssues = result.failed.map((operationIndex) => ({
      // 原始写操作下标，从零开始
      operationIndex,
      // 领域执行阶段失败的稳定错误类别
      code: "EXECUTION_FAILED",
      // 面向模型的具体错误说明
      message: `第 ${operationIndex + 1} 条操作未执行成功`,
    }));
    return {
      ...result,
      errors: executionIssues.map((issue) => issue.message),
      // 字段与格式校验已通过
      validationIssues: [],
      // 领域执行失败项
      executionIssues,
      // 写入后立即返回剩余问题，一键调整据此继续处理而不是自行猜测完成状态
      remainingIssues: ctx.getResumeIssues?.() ?? [],
    };
  },
  taskMeta: {
    effect: "mutation", // 该工具会修改当前简历数据。
    evidenceKind: "resume_change", // 执行结果生成简历写入证据。
    invalidatesRead: true, // 产生实际修改后旧读取数据失效。
    replayScope: "task", // 相同写入参数在本轮任务内只执行一次。
    // 写入结果统一区分完整成功、部分成功和未产生修改。
    evaluate: (result) => {
      const value = result && typeof result === "object" ? result as Record<string, any> : {};
      const changed = Array.isArray(value.changed) ? value.changed.length : 0;
      const hasWriteIssues = ["failed", "validationIssues", "executionIssues"]
        .some((key) => Array.isArray(value[key]) && value[key].length > 0);
      const remainingIssues = Array.isArray(value.remainingIssues) ? value.remainingIssues.length : 0;
      if (value.applied === true && changed > 0 && !hasWriteIssues) {
        return {
          status: "success",
          summary: `已完整执行 ${changed} 项简历修改`,
          facts: remainingIssues === 0 ? [RESUME_AGENT_FACTS.resumeIssuesResolved] : [],
        };
      }
      if (value.applied === true && changed > 0) {
        return { status: "partial", summary: `已执行 ${changed} 项简历修改，仍有未完成项` };
      }
      return { status: "failed", summary: "本次写入未产生简历修改" };
    },
  },
});
