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
    "指导 AI 根据本轮资料编写、修改、重命名、新增、删除或排序简历内容。",
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
    "self_intro",
    "task",
    "面试自我介绍",
    "根据用户简历生成面试自我介绍口头稿，突出核心优势、关键经历与求职意向。",
    () => import("./interview/skill_self_intro").then((module) => module.selfIntro()),
  ),
  registerSkill(
    "interview_prediction",
    "task",
    "面试押题",
    "基于目标岗位 JD 与个人简历预测高频面试题，提供参考答案、回答技巧与准备反馈。",
    () => import("./interview/skill_interview_prediction").then((module) => module.interviewPrediction()),
  ),
  registerSkill(
    "specialized_interview",
    "task",
    "专项面试模拟",
    "基于完整简历开展技术面或业务面的一对一模拟面试，逐轮追问并即时评分反馈。",
    () => import("./interview/skill_specialized_interview").then((module) => module.specializedInterview()),
  ),
  registerSkill(
    "resume_interview",
    "task",
    "AI 简历面试",
    "基于用户简历开展模拟面试，按考察方向（八股文 / 项目深挖）出题、反馈与点评。",
    () => import("./interview/skill_resume_interview").then((module) => module.resumeInterview()),
  ),
  registerSkill(
    "aptitude_hr_interview",
    "task",
    "行测与 HR 面试",
    "通过行测模拟与 HR 软技能面试双重维度，评估综合能力并给出针对性反馈。",
    () => import("./interview/skill_aptitude_hr_interview").then((module) => module.aptitudeHrInterview()),
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
  registerSkill(
    "industry_internet",
    "reference",
    "互联网/科技行业知识库",
    "互联网与科技行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理研发、算法、数据、产品、测试、运维等互联网科技岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_internet").then((module) => module.industryInternet()),
  ),
  registerSkill(
    "industry_finance",
    "reference",
    "金融/财会行业知识库",
    "金融与财会行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理银行、证券、基金、保险、财会审计等金融财会岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_finance").then((module) => module.industryFinance()),
  ),
  registerSkill(
    "industry_healthcare",
    "reference",
    "医疗/大健康行业知识库",
    "医疗与大健康行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理临床医疗、医药研发、医疗器械、医院管理、健康管理等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_healthcare").then((module) => module.industryHealthcare()),
  ),
  registerSkill(
    "industry_manufacturing",
    "reference",
    "制造/工业/供应链行业知识库",
    "制造、工业与供应链行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理生产制造、质量管理、供应链、采购、硬件研发、新能源等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_manufacturing").then((module) => module.industryManufacturing()),
  ),
  registerSkill(
    "industry_ecommerce",
    "reference",
    "电商/零售/快消行业知识库",
    "电商、零售与快消行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理电商运营、品牌市场、零售门店、快消营销、供应链等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_ecommerce").then((module) => module.industryEcommerce()),
  ),
  registerSkill(
    "industry_government",
    "reference",
    "公务员/国企/事业单位行业知识库",
    "公务员、国企与事业单位简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理行政、文秘、党群、综合管理、政策研究等机关与事业单位岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_government").then((module) => module.industryGovernment()),
  ),
  registerSkill(
    "industry_legal",
    "reference",
    "法律/法务行业知识库",
    "法律与法务行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理律师、公司法务、合规、知识产权、仲裁等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_legal").then((module) => module.industryLegal()),
  ),
  registerSkill(
    "industry_education",
    "reference",
    "教育/培训行业知识库",
    "教育与培训行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理教师、教研、课程设计、留学顾问、职业培训、教务管理等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_education").then((module) => module.industryEducation()),
  ),
  registerSkill(
    "industry_media",
    "reference",
    "媒体/广告/公关/文娱行业知识库",
    "媒体、广告、公关与文娱行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理广告投放、内容创意、公关传播、媒介、短视频、影视游戏等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_media").then((module) => module.industryMedia()),
  ),
  registerSkill(
    "industry_realestate",
    "reference",
    "地产/建筑/工程行业知识库",
    "地产、建筑与工程行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理地产开发、建筑设计、施工管理、工程造价、监理咨询等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_realestate").then((module) => module.industryRealEstate()),
  ),
  registerSkill(
    "industry_general",
    "reference",
    "通用行业知识库",
    "通用简历知识库：跨行业岗位族框架、通用量化维度与 JD 关键词识别法。当目标行业未匹配到专门行业知识库时读取，作为兜底。",
    () => import("./skill_industry_general").then((module) => module.industryGeneral()),
  ),
];

// 任务规划器只接收任务能力目录。
export const resumeTaskCapabilities = resumeSkillRegistry.filter((skill) => skill.role === "task");

// 统一参考工具只接收参考知识目录。
export const resumeReferenceSkills = resumeSkillRegistry.filter((skill) => skill.role === "reference");
