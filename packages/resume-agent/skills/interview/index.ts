import type { SkillLoader } from "../../types";
import { resumeTaskCapabilities } from "../registry";

const INTERVIEW_SKILL_IDS = new Set([
  "self_intro",
  "interview_prediction",
  "specialized_interview",
  "resume_interview",
  "aptitude_hr_interview",
]);

// 面试域只从统一能力目录派生加载入口，避免维护第二份技能注册清单。
export const interviewSkills: SkillLoader[] = resumeTaskCapabilities
  .filter((skill) => INTERVIEW_SKILL_IDS.has(skill.id))
  .map((skill) => skill.load);
