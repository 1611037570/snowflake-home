import type { InterviewMode, InterviewSkillPrompts } from "../types";

// 面试知识只供独立面试域按需使用，不再注册到简历编辑助手。
export const interviewSkillLoaders: Record<InterviewMode, () => Promise<InterviewSkillPrompts>> = {
  intro: () => import("./skill_self_intro").then((module) => module.selfIntro), // 按动作读取自我介绍规则。
  prediction: () => import("./skill_interview_prediction").then((module) => module.interviewPrediction), // 按动作读取押题规则。
  specialized: () => import("./skill_specialized_interview").then((module) => module.specializedInterview), // 按动作读取专项面试规则。
  resume: () => import("./skill_resume_interview").then((module) => module.resumeInterview), // 按动作读取简历面试规则。
  hr: () => import("./skill_aptitude_hr_interview").then((module) => module.aptitudeHrInterview), // 按动作读取行测与人事面试规则。
};
