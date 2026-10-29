import type { ResumeSnapshot } from "@snowflake/resume-core";

// 面试任务独立于简历编辑会话，不开放任何简历写入工具。
export type InterviewMode = "resume" | "specialized" | "hr" | "prediction" | "intro";
export type InterviewAction = "question" | "report" | "preparation" | "hint" | "reference";

export interface InterviewConfig {
  mode: InterviewMode; // 本次训练类型。
  position: string; // 目标岗位。
  experienceYears: string; // 用户确认的工作年限，可描述应届或具体年数。
  company: string; // 目标公司或行业背景。
  direction: string; // 技术、业务或项目等考察重点。
  feedback: "打分并给改进建议" | "只继续追问"; // 简历面试的逐轮反馈选择，专项与人事面试沿用固定即时评分。
  language: "中文" | "英语"; // 面试与报告使用的语言。
  jobDescription: string; // 可选的目标岗位要求，未提供时按岗位常见考察方向提问。
  background: string; // 本场已确认的补充背景，不作为开始面试的必填项。
  introWordCount: 100 | 200 | 300; // 自我介绍口头稿的目标字数。
  introStyle: "简洁" | "专业" | "热情"; // 自我介绍沿用原有表达风格。
}

export interface InterviewHistoryTurn {
  phase: string; // 本题实际所属的考察阶段。
  question: string; // 已实际生成的题目。
  answer: string; // 用户真实提交的作答。
  skipped: boolean; // 用户是否主动跳过。
  assisted: boolean; // 作答前是否使用提示或参考回答。
  durationSeconds: number; // 本题累计作答秒数。
}

export interface InterviewTaskInput {
  config: InterviewConfig; // 开始时固定的面试设置。
  resume: ResumeSnapshot; // 只读的脱敏简历快照，未关联简历时为空对象。
  turns: InterviewHistoryTurn[]; // 已完成的真实问答记录。
  question: string; // 提示或参考回答所针对的当前题目。
  previousReference: string; // 更换参考回答时的上一版，仅用于避免重复表达。
  phase: string; // 应用控制的当前考察阶段。
  endedEarly: boolean; // 专项或行测与人事面试是否未完成规定轮次便结束。
}
