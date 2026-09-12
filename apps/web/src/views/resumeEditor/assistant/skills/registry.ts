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
import { industryEcommerce } from "./skill_industry_ecommerce";
import { industryEducation } from "./skill_industry_education";
import { industryFinance } from "./skill_industry_finance";
import { industryGeneral } from "./skill_industry_general";
import { industryGovernment } from "./skill_industry_government";
import { industryHealthcare } from "./skill_industry_healthcare";
import { industryInternet } from "./skill_industry_internet";
import { industryLegal } from "./skill_industry_legal";
import { industryManufacturing } from "./skill_industry_manufacturing";
import { industryMedia } from "./skill_industry_media";
import { industryRealEstate } from "./skill_industry_realestate";

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
  industryInternet,
  industryFinance,
  industryHealthcare,
  industryManufacturing,
  industryEcommerce,
  industryGovernment,
  industryLegal,
  industryEducation,
  industryMedia,
  industryRealEstate,
  industryGeneral,
];