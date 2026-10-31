import type { ResumeWriteOp } from "./resumeOperations";
import { RESUME_AGENT_FACTS, type ResumeAgentTool, type ResumeAgentVerifiedChange } from "../runtime/types";
import { findResumeModuleSchema } from "@snowflake/resume-core/schema/resumeSchemaRegistry";
import { defineTool } from "./defineTool";
import { getResumeEditValidationIssues, normalizeResumeEdits } from "./resumeEdits";
import { PROPOSE_RESUME_EDITS_RULE, TOOL_ARGUMENT_RULE } from "./promptRules";
import type { ResumeToolContext } from "./tool_types";

// 只对新增记录跨调用去重；字段赋值可再次修正，下标操作的目标会随数据变化。
const getOperationSignature = (operation: ResumeWriteOp): string | undefined => {
  switch (operation.op) {
    case "addRecord":
      return `addRecord|${operation.module}|${JSON.stringify(operation.record ?? null)}`;
    default:
      return undefined;
  }
};

// 创建简历修改工具：校验后立即写入简历数据
export const createProposeResumeEditsTool = (ctx: ResumeToolContext): ResumeAgentTool => {
  // 本次请求内已经成功落库的写入意图，用于拦截模型重提全量操作
  const appliedSignatures = new Set<string>();
  return defineTool({
  name: "propose_resume_edits",
  description: `${TOOL_ARGUMENT_RULE}\n\n${PROPOSE_RESUME_EDITS_RULE}\n\n根据分析结果生成简历修改，调用后立即写入简历数据（用户可撤回）。operations 按下列操作类型描述写操作，提交前会做结构与格式校验；validationIssues 与 executionIssues 通过 operationIndex 标明失败操作，只修正对应项后重新提交。`,
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
                "操作类型：updateModule 改模块字段；updateModuleTitle 改模块标题，仅在明确要求重命名或翻译标题时使用，普通内容优化保持标题不变；updateRecord 改记录；addRecord 新增；deleteRecord 删除；moveRecord 排序",
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
              description: "模块展示标题，仅在明确重命名或翻译标题时使用；module 仍必须传稳定 key",
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
    const submittedOperations: ResumeWriteOp[] = Array.isArray(args?.operations) ? args.operations : [];
    const dataView = ctx.getResumeData() as any;
    // 富文本字段统一转换为编辑器 HTML，避免 Markdown 或纯文本直接落库
    const operations = normalizeResumeEdits(submittedOperations, dataView);
    // 空操作或缺失参数不能被当成合法写入结果
    const validationIssues = operations.length
      ? getResumeEditValidationIssues(operations, dataView)
      : [{ operationIndex: null, code: "INVALID_OPERATION", message: "operations 必须是非空的写操作数组" }];
    // 按钮入口的内容调整不能借模块标题承载岗位说明，违规操作由模型移除后重提。
    if (ctx.allowModuleTitleEdit === false) {
      operations.forEach((operation, operationIndex) => {
        if (operation?.op === "updateModuleTitle") {
          validationIssues.push({
            operationIndex,
            code: "INVALID_OPERATION",
            message: `第 ${operationIndex + 1} 条操作：当前任务保持模块展示标题不变，请修改实际简历内容`,
          });
        }
      });
    }
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
    // 只剔除已经成功新增的相同记录，字段修正与变化中的记录下标必须继续执行。
    const pending = operations
      .map((operation, index) => ({ operation, index }))
      .filter((item) => {
        const signature = getOperationSignature(item.operation);
        return !signature || !appliedSignatures.has(signature);
      });
    const duplicated = operations.length - pending.length;
    if (!pending.length) {
      // 全部操作都已在本次请求内写入成功，直接回报跳过，避免模型反复重提
      return {
        applied: true,
        changed: [],
        added: [],
        failed: [],
        errors: [],
        // 字段与格式校验已通过
        validationIssues: [],
        // 领域执行失败项为空
        executionIssues: [],
        // 写入后立即返回剩余问题，一键调整据此继续处理而不是自行猜测完成状态
        remainingIssues: ctx.getResumeIssues?.(),
        // 本轮被跳过的重复操作数量
        duplicated,
      };
    }
    // 工具只提交完整操作列表，具体执行语义由简历领域统一处理
    const result = ctx.applyResumeOperations(pending.map((item) => item.operation));
    // 逐项结果已经区分真实改动与同值提交，同批中有一项改动不会让其他同值赋值进入改动清单
    const changedIndexes = result.changed;
    const noChange = result.applied && !changedIndexes.length && result.failed.length === 0;
    // 成功新增的记录记入签名表，其他操作不按字段名或下标误判为重复。
    pending.forEach((item, index) => {
      const signature = getOperationSignature(item.operation);
      if (signature && changedIndexes.includes(index)) appliedSignatures.add(signature);
    });
    const toOriginalIndex = (index: number) => pending[index]?.index ?? index;
    // 仅根据宿主确认真实变化的操作生成报告条目，失败与同值操作不会进入改动清单。
    const verifiedChanges: ResumeAgentVerifiedChange[] = changedIndexes.flatMap((index) => {
      const operation = pending[index]?.operation;
      if (!operation) return [];
      const module = dataView[operation.module]?.title || operation.module;
      const field = "field" in operation
        ? findResumeModuleSchema(operation.module, dataView[operation.module]?.data)
          ?.fields.find((item) => item.key === operation.field)?.label || operation.field
        : "";
      const summary = operation.op === "updateModuleTitle" ? "更新模块标题"
        : operation.op === "updateModule" || operation.op === "updateRecord" ? `调整${field}`
          : operation.op === "addRecord" ? "新增记录"
            : operation.op === "deleteRecord" ? "删除记录" : "调整记录顺序";
      return [{ module, summary }];
    });
    // 真实改动涉及的模块，供任务验收判断读取范围是否全部处理
    const changedModuleKeys = [...new Set(changedIndexes.map((index) => pending[index]?.operation.module))]
      .filter((key): key is string => typeof key === "string");
    // 执行失败与字段写入失败分开上报：后者记录已创建，只需补填字段而不必整条重提
    const executionIssues = [
      ...result.failed.map((index) => ({
        // 原始写操作下标，从零开始
        operationIndex: toOriginalIndex(index),
        // 领域执行阶段失败的稳定错误类别
        code: "EXECUTION_FAILED",
        // 面向模型的具体错误说明
        message: `第 ${toOriginalIndex(index) + 1} 条操作未执行成功`,
      })),
      ...(result.fieldFailures ?? []).map((item) => ({
        // 对应新增记录在模型提交列表中的下标
        operationIndex: toOriginalIndex(item.operationIndex),
        // 记录已创建、仅字段未写入的稳定错误类别
        code: "FIELD_WRITE_FAILED",
        // 明确指出需要补填的字段与补救方式
        message: `第 ${toOriginalIndex(item.operationIndex) + 1} 条操作已创建记录，但字段 ${item.field} 写入失败，请用 updateRecord 补填`,
      })),
    ];
    return {
      ...result,
      // 宿主已接受本批操作；是否真的产生改动由 changed 逐项说明。
      applied: result.applied,
      // 同值提交属于已处理但未产生新效果，完成校验仍需此前真实写入证据。
      noChange,
      // 回报时统一换算回模型提交的操作下标
      changed: changedIndexes.map(toOriginalIndex),
      verifiedChanges,
      // 真实改动涉及的模块 key，用于读取范围覆盖校验
      changedModuleKeys,
      failed: result.failed.map(toOriginalIndex),
      errors: executionIssues.map((issue) => issue.message),
      // 字段与格式校验已通过
      validationIssues: [],
      // 领域执行失败项
      executionIssues,
      // 写入后立即返回剩余问题，一键调整据此继续处理而不是自行猜测完成状态
      remainingIssues: ctx.getResumeIssues?.(),
      // 本轮被跳过的重复操作数量
      duplicated,
    };
  },
  // 该工具会修改当前简历数据。
  effect: "mutation",
  // 写入前必须已读取当前数据，前次写入后需重新读取。
  requiresEvidence: ["read"],
  // 相同写入参数在本轮任务内只执行一次。
  replayScope: "task",
  // 写入结果统一区分完整成功、部分成功和未产生修改。
  evaluate: (result) => {
    const value = result && typeof result === "object" ? result as Record<string, any> : {};
    const changed = Array.isArray(value.changed) ? value.changed.length : 0;
    const hasWriteIssues = ["failed", "validationIssues", "executionIssues"]
      .some((key) => Array.isArray(value[key]) && value[key].length > 0);
    // 未启用完成度检查时不生成“问题已全部解决”的业务事实。
    const remainingIssues = Array.isArray(value.remainingIssues) ? value.remainingIssues.length : null;
    const duplicated = typeof value.duplicated === "number" ? value.duplicated : 0;
    const verifiedChanges = Array.isArray(value.verifiedChanges) ? value.verifiedChanges : [];
    // 真实改动涉及的模块事实，供读取范围覆盖校验使用
    const moduleFacts = (Array.isArray(value.changedModuleKeys) ? value.changedModuleKeys : [])
      .filter((key: unknown): key is string => typeof key === "string")
      .map((key: string) => `module:${key}`);
    if (value.applied === true && changed > 0 && !hasWriteIssues) {
      return {
        status: "success",
        summary: `已完整执行 ${changed} 项简历修改`,
        changed: true,
        verifiedChanges,
        facts: [...moduleFacts, ...(remainingIssues === 0 ? [RESUME_AGENT_FACTS.resumeIssuesResolved] : [])],
      };
    }
    if (value.applied === true && changed > 0) {
      return {
        status: "partial",
        summary: `已执行 ${changed} 项简历修改，仍有未完成项`,
        changed: true,
        verifiedChanges,
        facts: moduleFacts,
      };
    }
    // 已接受的同值提交不覆盖此前成功证据，但不能单独满足写入要求。
    if (value.noChange === true) {
      return {
        status: "success",
        summary: "提交内容与当前简历相同，未产生改动",
        changed: false,
        facts: remainingIssues === 0 ? [RESUME_AGENT_FACTS.resumeIssuesResolved] : [],
      };
    }
    // 重复提交已经写入过的操作按成功处理，避免模型反复重提同一批修改
    if (value.applied === true && duplicated > 0 && !hasWriteIssues) {
      return {
        status: "success",
        summary: `这 ${duplicated} 项修改本轮已经写入，未重复执行`,
        changed: false,
        facts: remainingIssues === 0 ? [RESUME_AGENT_FACTS.resumeIssuesResolved] : [],
      };
    }
    return { status: "failed", summary: "本次写入未产生简历修改", changed: false };
  },
  });
};
