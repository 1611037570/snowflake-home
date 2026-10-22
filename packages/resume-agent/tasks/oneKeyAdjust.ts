import { RESUME_AGENT_FACTS } from "../runtime/types";
import type { ResumeAgentTaskProfile } from "../runtime/taskTypes";
import { ASSISTANT_WRITING_RULES_TEXT } from "../writingRules";

// 一键调整只由按钮入口装配，不注册为通用对话技能。
export const ONE_KEY_ADJUST_TASK: ResumeAgentTaskProfile = {
  id: "oneKeyAdjust", // 按钮任务稳定标识。
  objective: "修复整份简历当前检查发现的缺失、格式和时间线问题", // 按钮已经明确的任务目标。
  requiredEffects: ["resume_change"], // 本任务必须实际修改当前简历。
  successCondition: "当前检查发现的简历问题已完成调整，并明确标出仍需用户确认的临时内容", // 用户可核对的完成条件。
  completionPolicy: {
    requiredFacts: [RESUME_AGENT_FACTS.resumeIssuesResolved], // 工具返回的剩余问题必须为空。
  },
  instructions: `# 执行
- 读取整份简历，对照检查结果只处理仍存在的问题；写入前通过参考知识工具读取《简历数据规范》确认字段格式。本任务已包含写入规则，无需额外加载同类任务能力。
- 格式问题先从现有值无歧义修复；简介和技能等可从真实经历归纳。确实缺少信息时，本任务允许生成格式合法的临时内容，包括日期、联系方式和经历细节，但不得当成已核实事实。
- 将可处理的问题合并提交给 propose_resume_edits；根据工具返回的未完成项继续修正。所有问题处理完成后再输出结果。
- 不修改检查范围外的内容，不在执行中逐项询问；所有推断与临时内容在结果中逐项标明待确认原因。

# 正文写作
${ASSISTANT_WRITING_RULES_TEXT}

# 输出
简要列出实际完成的调整和待确认内容，不展示内部字段路径或工具过程。`, // 该按钮任务独有的执行与输出规则。
};
