import type { SkillFactory } from "../types";
import { defaultPrompt } from "./prompt_default";
import { greeting } from "./skill_greeting";
import { jobMatch } from "./skill_job_match";
import { resumeCreate } from "./skill_resume_create";
import { resumeDataContract } from "./skill_resume_data_contract";
import { resumeInterview } from "./skill_resume_interview";
import { resumeOptimization } from "./skill_resume_optimization";
import { resumeScore } from "./skill_resume_score";
import { resumeTranslate } from "./skill_resume_translate";
import { resumeWriting } from "./skill_resume_writing";
import { selfIntro } from "./skill_self_intro";

// 常驻技能：按顺序作为系统消息注入对话
export const residentSkills: SkillFactory[] = [defaultPrompt];

// 按需技能：注册为只读工具，模型需要时调用读取全文
export const onDemandSkills: SkillFactory[] = [
  resumeDataContract,
  resumeWriting,
  resumeOptimization,
  jobMatch,
  greeting,
  resumeCreate,
  resumeInterview,
  resumeScore,
  resumeTranslate,
  selfIntro,
];
