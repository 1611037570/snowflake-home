import { ASSISTANT_WRITING_RULES_TEXT } from "../writingRules";

// 一键调整技能：处理完成度检查发现的缺失、格式与时间线问题，不扩展到泛化内容优化。
export const resumeOneKeyAdjust = () => ({
  id: "resume_one_key_adjust", // 技能稳定标识。
  name: "一键调整", // 技能展示名称。
  description: "根据完成度检查结果一次性补齐和修复问题，并标出生成后需要用户确认的内容。", // 技能用途说明。
  instructions: `# 执行
- 读取整份简历，对照检查结果只处理仍存在的问题；写入前读取 resume_data_contract 确认字段格式。本技能已包含写入流程，无需再读取 resume_writing。
- 格式问题先从现有值无歧义修复；简介和技能等可从真实经历归纳。确实缺少信息时，本任务允许生成格式合法的临时内容，包括日期、联系方式和经历细节，但不得当成已核实事实。
- 将可处理的问题合并提交给 propose_resume_edits；根据 validationIssues、errors 与 remainingIssues 修正失败项，重新读取最新简历后仅重试未成功操作。没有真实写入或仍有问题时不声称全部完成。
- 不修改检查范围外的内容，不在执行中逐项询问；所有推断与临时内容在结果中逐项标明待确认原因。

# 正文写作
${ASSISTANT_WRITING_RULES_TEXT}

# 输出
简要列出实际完成的调整和待确认内容，不展示内部字段路径或工具过程。`, // 技能执行规则。
});
