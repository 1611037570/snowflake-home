import type { SkillFactory } from "../../types";
import { aptitudeHrInterview } from "./skill_aptitude_hr_interview";
import { interviewPrediction } from "./skill_interview_prediction";
import { resumeInterview } from "./skill_resume_interview";
import { selfIntro } from "./skill_self_intro";
import { specializedInterview } from "./skill_specialized_interview";

// 面试域技能通过单一列表注册，未来迁移页面时无需改动技能内容
export const interviewSkills: SkillFactory[] = [
  selfIntro,
  interviewPrediction,
  specializedInterview,
  resumeInterview,
  aptitudeHrInterview,
];
