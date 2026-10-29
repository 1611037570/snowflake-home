import type { InterviewAction, InterviewConfig } from "@snowflake/interview-agent";
import type { ResumeSnapshot } from "@snowflake/resume-core";

export interface InterviewOutput {
  content: string; // 固定流程或模型返回的正文，停止时保留已生成内容。
  status: "empty" | "generating" | "complete" | "interrupted" | "error"; // 当前内容的生成状态。
  error: string; // 请求失败的具体说明。
}

export interface InterviewTurn {
  id: string; // 题目稳定编号。
  phase: string; // 本题所属考察阶段。
  question: InterviewOutput; // 面试官实际提出的题目。
  answer: string; // 已提交的真实作答。
  submitted: boolean; // 是否已经提交或跳过，防止重复计题。
  skipped: boolean; // 是否主动跳过本题。
  assisted: boolean; // 是否使用过提示或参考回答。
  durationSeconds: number; // 本题累计思考与作答时长。
  hint: InterviewOutput; // 本题独立保存的思考提示。
  reference: InterviewOutput; // 本题独立保存的参考回答。
}

export interface InterviewSession {
  id: string; // 独立面试记录编号。
  title: string; // 历史记录展示标题。
  createdAt: number; // 创建时间。
  updatedAt: number; // 最近一次内容或状态变化时间。
  config: InterviewConfig; // 开始时固定的训练设置。
  resumeId: string; // 可选参考简历编号，未关联时为空字符串。
  resumeTitle: string; // 开始时的参考简历标题，未关联时为空字符串。
  resumeSnapshot: ResumeSnapshot; // 固定的只读脱敏简历事实，未关联时为空对象，删除原简历后仍可复盘。
  status: "active" | "paused" | "completed"; // 进行中、暂停或已结束。
  elapsedMs: number; // 实际训练时长，不包含暂停时间。
  draft: string; // 当前未提交的回答草稿。
  turns: InterviewTurn[]; // 按真实顺序保存的逐题问答。
  preparation: InterviewOutput; // 自我介绍或押题生成结果。
  report: InterviewOutput; // 结束后单独保存的复盘报告。
  pendingAction: InterviewAction | null; // 待执行、正在生成或中断后可恢复的动作，作答时为空。
  endedEarly: boolean; // 是否在计划完成前结束。
}
