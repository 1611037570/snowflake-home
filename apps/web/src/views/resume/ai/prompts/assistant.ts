// 助手反思轮提示：只修正冲突或格式问题，不扩写交互内容。
export const ASSISTANT_REFLECT_PROMPT =
  "请检查上一条内容：若与用户任务冲突或格式被破坏，只输出修正后的完整内容；否则逐字原样输出。禁止输出任何解释、理解过程、思考、说明、标题或额外新增内容；若上一条内容本身是提问或交互内容，保持原样，不得拆分或补充新问题。";

// 强制写入提示：所有修改类任务的最终结论必须以真实工具写入为依据。
export const REQUIRED_RESUME_WRITE_PROMPT =
  "本轮用户要求直接修改简历，必须调用 propose_resume_edits 并确认返回 applied 为 true、changed 非空、errors 为空。validationIssues 与 executionIssues 按 operationIndex 指出失败项，只修正对应操作；未真实写入时禁止只给建议、示例、修改方案，或输出已完成、已更新。";
