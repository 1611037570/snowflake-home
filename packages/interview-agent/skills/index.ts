import type { AgentSkill } from "@snowflake/agent";
import type { InterviewMode } from "../types";

// 面试知识只供独立面试域按需使用，不再注册到简历编辑助手。
export const interviewSkillLoaders: Record<InterviewMode, () => Promise<AgentSkill>> = {
  intro: () => import("./skill_self_intro").then((module) => module.selfIntro()), // 自我介绍原有技能。
  prediction: () => import("./skill_interview_prediction").then((module) => module.interviewPrediction()), // 面试押题原有技能。
  specialized: () => import("./skill_specialized_interview").then((module) => module.specializedInterview()), // 专项模拟原有技能。
  resume: () => import("./skill_resume_interview").then((module) => module.resumeInterview()), // 简历面试原有技能。
  hr: () => import("./skill_aptitude_hr_interview").then((module) => module.aptitudeHrInterview()), // 行测与人事面试原有技能。
};
