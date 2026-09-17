import type { SkillLoader } from "../../types";

// 面试域技能通过单一列表注册，只登记懒加载入口，技能正文在组装工具列表时才拉取
export const interviewSkills: SkillLoader[] = [
  () => import("./skill_self_intro").then((module) => module.selfIntro()),
  () => import("./skill_interview_prediction").then((module) => module.interviewPrediction()),
  () => import("./skill_specialized_interview").then((module) => module.specializedInterview()),
  () => import("./skill_resume_interview").then((module) => module.resumeInterview()),
  () => import("./skill_aptitude_hr_interview").then((module) => module.aptitudeHrInterview()),
];
