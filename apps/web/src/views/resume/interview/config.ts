import type { InterviewAction, InterviewConfig, InterviewMode } from "@snowflake/interview-agent";
export { INTERVIEW_INTRO_PHASE, INTERVIEW_INTRO_SECONDS, getInterviewLocalReply, getInterviewQuestionLimit, getInterviewCompletedCount, getInterviewPhase, getInterviewStages, isInterviewComplete } from "@snowflake/interview-agent";
import { getUUID } from "@/utils";
import type { InterviewOutput, InterviewTurn } from "./types";

export interface InterviewModeOption {
  value: InterviewMode; // 训练类型标识。
  label: string; // 训练名称。
  icon: string; // 已登记的训练图标。
  description: string; // 训练用途说明。
  detail: string; // 训练内容与节奏。
}

export const INTERVIEW_MODES: InterviewModeOption[] = [
  { value: "resume", label: "AI 简历面试", icon: "ph:chats-teardrop-duotone", description: "按求职岗位练习八股文或项目深挖，可选参考简历", detail: "逐轮单问与追问，可选择评分，主动结束后统一点评" },
  { value: "specialized", label: "专项面试模拟", icon: "ph:microphone-stage-duotone", description: "选择技术面或业务面，逐轮追问并即时评分", detail: "十轮有效回答后完整复盘，也可随时提前结束" },
  { value: "hr", label: "行测与 HR 面试", icon: "ph:exam-duotone", description: "先进行行测，再结合真实经历评估软技能", detail: "十道行测 + 六道 HR · 约四十五分钟 · 逐题反馈" },
  { value: "prediction", label: "面试押题", icon: "ph:crosshair-duotone", description: "按岗位与年限整理高频面试题，可选职位描述和简历", detail: "出题依据、参考答案、回答技巧与准备反馈报告" },
  { value: "intro", label: "面试自我介绍", icon: "ph:microphone-duotone", description: "按字数和风格，将真实经历组织成口头稿", detail: "一百、两百或三百字 · 简洁、专业或热情" },
];

export const createInterviewConfig = (): InterviewConfig => ({
  mode: "resume", // 默认从真实简历经历开展训练。
  position: "", // 由用户确认目标岗位。
  experienceYears: "", // 开始前选择或从参考简历自动带入的工作年限。
  company: "", // 可补充目标公司或行业。
  direction: "项目深挖", // 默认考察项目经历。
  feedback: "打分并给改进建议", // 简历面试默认逐轮评分，其他类型遵循原技能。
  language: "中文", // 默认使用中文训练。
  jobDescription: "", // 可补充真实岗位要求。
  background: "", // 可补充个人真实背景。
  introWordCount: 200, // 原自我介绍技能的缺省字数。
  introStyle: "简洁", // 默认自我介绍口头稿风格。
});

export const createInterviewOutput = (): InterviewOutput => ({
  content: "", // 尚未生成正文。
  status: "empty", // 尚未发起请求。
  error: "", // 尚无请求错误。
});

// 新题初始化集中维护，重试沿用原题，不重新初始化回答或用时。
export const createInterviewTurn = (phase: string): InterviewTurn => ({
  id: getUUID(), // 稳定轮次编号。
  phase, // 本轮实际考察阶段。
  question: createInterviewOutput(), // 待生成的面试题目。
  answer: "", // 尚未提交回答。
  submitted: false, // 当前轮次尚未完成。
  skipped: false, // 尚未主动跳过。
  assisted: false, // 尚未使用辅助内容。
  durationSeconds: 0, // 尚未累计作答时间。
  hint: createInterviewOutput(), // 本轮思考提示。
  reference: createInterviewOutput(), // 本轮参考回答。
});

export const isPreparationMode = (mode: InterviewMode) => mode === "intro" || mode === "prediction";
export const getModeLabel = (mode: InterviewMode) => INTERVIEW_MODES.find((item) => item.value === mode)?.label || "面试训练";

export const INTERVIEW_ACTION_LABELS: Record<InterviewAction, string> = {
  question: "面试题", // 当前题目的生成内容。
  report: "复盘报告", // 本场实际作答的复盘内容。
  preparation: "准备材料", // 岗位押题或自我介绍内容。
  hint: "思考提示", // 当前题目的思路辅助。
  reference: "参考回答", // 当前题目的回答示例。
};

export const formatInterviewDuration = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
};
