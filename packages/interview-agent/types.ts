import type { ResumeSnapshot } from "@snowflake/resume-core";

// 面试任务独立于简历编辑会话，不开放任何简历写入工具。
export type InterviewMode = "resume" | "specialized" | "hr" | "prediction" | "intro";
export type InterviewAction = "question" | "clarification" | "report" | "preparation" | "hint" | "reference";

// 面试技能只维护各动作的规则，不携带简历规划器使用的技能元数据。
export type InterviewSkillPrompts = Partial<Record<InterviewAction, string>>;

export interface InterviewConfig {
  mode: InterviewMode; // 本次训练类型。
  position: string; // 目标岗位。
  experienceYears: string; // 用户确认的工作年限，可描述应届或具体年数。
  company: string; // 目标公司或行业背景。
  direction: string; // 专项面试的训练重点，综合面试由模型结合岗位与经历安排。
  language: "中文" | "英语"; // 面试与报告使用的语言。
  jobDescription: string; // 可选的目标岗位要求，未提供时按岗位常见考察方向提问。
  background: string; // 本场已确认的补充背景，不作为开始面试的必填项。
}

export interface InterviewClarification {
  request: string; // 用户针对题意提出的澄清请求，不作为正式作答。
  explanation: string; // 面试官已经完成的题意说明，不作为能力评价证据。
}

export interface InterviewHistoryTurn {
  phase: string; // 本题实际所属的考察阶段。
  question: string; // 已实际生成的题目。
  answer: string; // 用户真实提交的作答。
  skipped: boolean; // 用户是否主动跳过。
  clarifications?: InterviewClarification[]; // 本题已完成的澄清对话，仅帮助理解作答上下文。
  durationSeconds: number; // 本题累计作答秒数。
}

export interface InterviewTaskInput {
  config: InterviewConfig; // 开始时固定的面试设置。
  resume: ResumeSnapshot; // 只读的脱敏简历快照，未关联简历时为空对象。
  turns: InterviewHistoryTurn[]; // 出题与复盘使用已提交历史，澄清与回看只提供当前题上下文。
  question: string; // 澄清或结束后回看所针对的题目。
  clarificationRequest: string; // 当前需要解释的题意疑问，其他动作为空。
  previousReference: string; // 更换所选题目的参考回答时提供上一版，保留正确结论并调整表达。
  phase: string; // 应用控制的考察阶段，逐题回看沿用选中题目的阶段。
  endedEarly: boolean; // 专项或行测与人事面试是否未完成规定轮次便结束。
}
