import { resumeIndustryKnowledge } from "@snowflake/resume-core";
import type { SkillLoader, SkillRegistration, SkillRole } from "../types";

// 统一生成轻量注册项，技能正文只保留在各自模块中。
const registerSkill = (
  id: string,
  role: Exclude<SkillRole, "resident">,
  name: string,
  description: string,
  load: SkillLoader,
): SkillRegistration => ({ id, role, name, description, load });

// 简历智能体的完整按需能力目录；这里只保存规划所需摘要和正文加载入口。
export const resumeSkillRegistry: SkillRegistration[] = [
  registerSkill(
    "resume_data_contract",
    "reference",
    "简历数据规范",
    "本技能提供由当前简历表单结构自动生成的数据契约。当 AI 需要了解模块、字段、可添加字段、枚举值与时间或富文本格式时必须加载；不得臆造未声明字段。",
    () => import("./skill_resume_data_contract").then((module) => module.resumeDataContract()),
  ),
  registerSkill(
    "resume_writing",
    "task",
    "简历编写",
    "根据求职目标和已有资料编写或改进简历内容，兼顾结构、事实与表达。",
    () => import("./skill_resume_writing").then((module) => module.resumeWriting()),
  ),
  registerSkill(
    "resume_optimization",
    "task",
    "简历写作方法论",
    "简历写作方法：按求职目标定位问题，基于真实证据改进表达，优化或编写简历时按需读取。",
    () => import("./skill_resume_optimization").then((module) => module.resumeOptimization()),
  ),
  registerSkill(
    "job_match",
    "task",
    "岗位匹配与 ATS 优化",
    "分析目标岗位 JD 与当前简历的匹配度，并给出对标改写与补强方向。",
    () => import("./skill_job_match").then((module) => module.jobMatch()),
  ),
  registerSkill(
    "greeting",
    "task",
    "打招呼语",
    "根据用户简历生成开场打招呼语（投递、沟通开场），可指定正式、亲切、幽默等风格。",
    () => import("./skill_greeting").then((module) => module.greeting()),
  ),
  registerSkill(
    "resume_score",
    "task",
    "AI 简历评估",
    "对简历做全方位综合评估：先体检，再从信息完整度、阅读效率、职业契合度、职业成就、发展潜力与职业稳定性六个维度打分并给出改进建议。",
    () => import("./skill_resume_score").then((module) => module.resumeScore()),
  ),
  registerSkill(
    "resume_translate",
    "task",
    "简历翻译",
    "指导 AI 翻译当前所选简历范围或整份简历：保持结构对应、不增删、不改写原意。",
    () => import("./skill_resume_translate").then((module) => module.resumeTranslate()),
  ),
  registerSkill(
    "career_planning",
    "task",
    "职业规划",
    "根据整份简历中的经历、能力与职业方向，生成有依据的阶段性职业规划。",
    () => import("./skill_career_planning").then((module) => module.careerPlanning()),
  ),
  registerSkill(
    "life_summary",
    "task",
    "人生总结",
    "根据整份简历梳理经历脉络、关键成果与成长主题，生成有事实依据的阶段总结。",
    () => import("./skill_life_summary").then((module) => module.lifeSummary()),
  ),
  ...resumeIndustryKnowledge,
];

// 任务规划器只接收任务能力目录。
export const resumeTaskCapabilities = resumeSkillRegistry.filter((skill) => skill.role === "task");

// 统一参考工具只接收参考知识目录。
export const resumeReferenceSkills = resumeSkillRegistry.filter((skill) => skill.role === "reference");
