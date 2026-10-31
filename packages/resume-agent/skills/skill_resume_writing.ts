// 技能：简历编写
// 描述：提供生成、修改与优化简历内容时共用的写作方法
import type { Skill } from "../types";
import { ASSISTANT_WRITING_RULES_TEXT } from "../writingRules";
export const resumeWriting = (): Skill => ({
  id: "resume_writing",
  completionPolicy: { requiredEvidence: ["read"] }, // 编写建议必须基于真实读取的简历。
  role: "task" as const, // 参与任务契约规划的任务能力。
  name: "简历编写",
  description: `根据求职目标和已有资料编写或改进简历内容，兼顾结构、事实与表达。`,
  instructions: `# 内容判断
- 根据本轮目标和现有素材判断需要起草、改写、精简或保留哪些内容；已有事实不得擅自替换，表达方式与篇幅由内容决定。
- 先判断当前模块和字段的数据形态；富文本字段使用 HTML，技能列表按列表字段填写。
- 工作与项目经历按经历规则组织，具体表达按经历重点决定；候选内容与未知身份字段按共用写作规则处理。

# 正文写作
${ASSISTANT_WRITING_RULES_TEXT}

# 结果说明
完成内容前检查目标岗位相关性、个人贡献、结果表达、重复内容和占位位置；需要说明改动时概括实际结果与 XX 占位内容，用户要求完整正文时按要求给出。`,
});
