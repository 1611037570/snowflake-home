import type { SkillFactory, SkillLoader } from "@snowflake/resume-agent/types";
import { interviewSkills } from "@snowflake/resume-agent/skills/interview";
import { defaultPrompt } from "./defaultPrompt";

// 常驻技能：按顺序作为系统消息注入对话
export const residentSkills: SkillFactory[] = [defaultPrompt];

// 按需技能：任务能力交给契约规划器选择，参考知识通过统一工具读取。
export const onDemandSkills: SkillLoader[] = [
  () => import("@snowflake/resume-agent/skills/skill_resume_data_contract").then((module) => module.resumeDataContract()),
  () => import("@snowflake/resume-agent/skills/skill_resume_writing").then((module) => module.resumeWriting()),
  () => import("@snowflake/resume-agent/skills/skill_resume_optimization").then((module) => module.resumeOptimization()),
  () => import("@snowflake/resume-agent/skills/skill_job_match").then((module) => module.jobMatch()),
  () => import("@snowflake/resume-agent/skills/skill_greeting").then((module) => module.greeting()),
  // 面试域技能通过独立清单整体注入，注册器不再感知单项实现
  ...interviewSkills,
  () => import("@snowflake/resume-agent/skills/skill_resume_score").then((module) => module.resumeScore()),
  () => import("@snowflake/resume-agent/skills/skill_resume_translate").then((module) => module.resumeTranslate()),
  () => import("@snowflake/resume-agent/skills/skill_career_planning").then((module) => module.careerPlanning()),
  () => import("@snowflake/resume-agent/skills/skill_life_summary").then((module) => module.lifeSummary()),
  () => import("@snowflake/resume-agent/skills/skill_industry_internet").then((module) => module.industryInternet()),
  () => import("@snowflake/resume-agent/skills/skill_industry_finance").then((module) => module.industryFinance()),
  () => import("@snowflake/resume-agent/skills/skill_industry_healthcare").then((module) => module.industryHealthcare()),
  () => import("@snowflake/resume-agent/skills/skill_industry_manufacturing").then((module) => module.industryManufacturing()),
  () => import("@snowflake/resume-agent/skills/skill_industry_ecommerce").then((module) => module.industryEcommerce()),
  () => import("@snowflake/resume-agent/skills/skill_industry_government").then((module) => module.industryGovernment()),
  () => import("@snowflake/resume-agent/skills/skill_industry_legal").then((module) => module.industryLegal()),
  () => import("@snowflake/resume-agent/skills/skill_industry_education").then((module) => module.industryEducation()),
  () => import("@snowflake/resume-agent/skills/skill_industry_media").then((module) => module.industryMedia()),
  () => import("@snowflake/resume-agent/skills/skill_industry_realestate").then((module) => module.industryRealEstate()),
  () => import("@snowflake/resume-agent/skills/skill_industry_general").then((module) => module.industryGeneral()),
];
