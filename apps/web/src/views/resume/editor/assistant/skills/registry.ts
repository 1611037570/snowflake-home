import type { SkillFactory, SkillLoader } from "../types";
import { interviewSkills } from "../interview/skills";
import { defaultPrompt } from "./prompt_default";

// 常驻技能：按顺序作为系统消息注入对话
export const residentSkills: SkillFactory[] = [defaultPrompt];

// 按需技能：只登记懒加载入口，首次组装工具列表时才拉取技能正文
export const onDemandSkills: SkillLoader[] = [
  () => import("./skill_resume_data_contract").then((module) => module.resumeDataContract()),
  () => import("./skill_resume_writing").then((module) => module.resumeWriting()),
  () => import("./skill_resume_optimization").then((module) => module.resumeOptimization()),
  () => import("./skill_resume_one_key_optimize").then((module) => module.resumeOneKeyOptimize()),
  () => import("./skill_job_match").then((module) => module.jobMatch()),
  () => import("./skill_greeting").then((module) => module.greeting()),
  // 面试域技能通过独立清单整体注入，注册器不再感知单项实现
  ...interviewSkills,
  () => import("./skill_resume_create").then((module) => module.resumeCreate()),
  () => import("./skill_resume_score").then((module) => module.resumeScore()),
  () => import("./skill_resume_translate").then((module) => module.resumeTranslate()),
  () => import("./skill_career_planning").then((module) => module.careerPlanning()),
  () => import("./skill_life_summary").then((module) => module.lifeSummary()),
  () => import("./skill_industry_internet").then((module) => module.industryInternet()),
  () => import("./skill_industry_finance").then((module) => module.industryFinance()),
  () => import("./skill_industry_healthcare").then((module) => module.industryHealthcare()),
  () => import("./skill_industry_manufacturing").then((module) => module.industryManufacturing()),
  () => import("./skill_industry_ecommerce").then((module) => module.industryEcommerce()),
  () => import("./skill_industry_government").then((module) => module.industryGovernment()),
  () => import("./skill_industry_legal").then((module) => module.industryLegal()),
  () => import("./skill_industry_education").then((module) => module.industryEducation()),
  () => import("./skill_industry_media").then((module) => module.industryMedia()),
  () => import("./skill_industry_realestate").then((module) => module.industryRealEstate()),
  () => import("./skill_industry_general").then((module) => module.industryGeneral()),
];
