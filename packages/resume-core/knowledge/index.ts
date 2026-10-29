import type { ResumeKnowledgeRegistration } from "./types";

const registerKnowledge = (
  id: string,
  role: "reference",
  name: string,
  description: string,
  load: ResumeKnowledgeRegistration["load"],
): ResumeKnowledgeRegistration => ({
  id, // 资料稳定标识。
  role, // 资料只作为参考内容使用。
  name, // 资料展示名称。
  description, // 提供给读取工具的用途摘要。
  load, // 正文按需加载入口。
});

export const resumeIndustryKnowledge: ResumeKnowledgeRegistration[] = [
  registerKnowledge(
    "industry_internet",
    "reference",
    "互联网/科技行业知识库",
    "互联网与科技行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理研发、算法、数据、产品、测试、运维等互联网科技岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_internet").then((module) => module.industryInternet()),
  ),
  registerKnowledge(
    "industry_finance",
    "reference",
    "金融/财会行业知识库",
    "金融与财会行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理银行、证券、基金、保险、财会审计等金融财会岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_finance").then((module) => module.industryFinance()),
  ),
  registerKnowledge(
    "industry_healthcare",
    "reference",
    "医疗/大健康行业知识库",
    "医疗与大健康行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理临床医疗、医药研发、医疗器械、医院管理、健康管理等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_healthcare").then((module) => module.industryHealthcare()),
  ),
  registerKnowledge(
    "industry_manufacturing",
    "reference",
    "制造/工业/供应链行业知识库",
    "制造、工业与供应链行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理生产制造、质量管理、供应链、采购、硬件研发、新能源等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_manufacturing").then((module) => module.industryManufacturing()),
  ),
  registerKnowledge(
    "industry_ecommerce",
    "reference",
    "电商/零售/快消行业知识库",
    "电商、零售与快消行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理电商运营、品牌市场、零售门店、快消营销、供应链等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_ecommerce").then((module) => module.industryEcommerce()),
  ),
  registerKnowledge(
    "industry_government",
    "reference",
    "公务员/国企/事业单位行业知识库",
    "公务员、国企与事业单位简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理行政、文秘、党群、综合管理、政策研究等机关与事业单位岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_government").then((module) => module.industryGovernment()),
  ),
  registerKnowledge(
    "industry_legal",
    "reference",
    "法律/法务行业知识库",
    "法律与法务行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理律师、公司法务、合规、知识产权、仲裁等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_legal").then((module) => module.industryLegal()),
  ),
  registerKnowledge(
    "industry_education",
    "reference",
    "教育/培训行业知识库",
    "教育与培训行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理教师、教研、课程设计、留学顾问、职业培训、教务管理等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_education").then((module) => module.industryEducation()),
  ),
  registerKnowledge(
    "industry_media",
    "reference",
    "媒体/广告/公关/文娱行业知识库",
    "媒体、广告、公关与文娱行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理广告投放、内容创意、公关传播、媒介、短视频、影视游戏等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_media").then((module) => module.industryMedia()),
  ),
  registerKnowledge(
    "industry_realestate",
    "reference",
    "地产/建筑/工程行业知识库",
    "地产、建筑与工程行业简历知识库：岗位族、JD 关键词、量化维度与表达要点。处理地产开发、建筑设计、施工管理、工程造价、监理咨询等岗位的简历优化、编写或 JD 匹配时读取。",
    () => import("./skill_industry_realestate").then((module) => module.industryRealEstate()),
  ),
  registerKnowledge(
    "industry_general",
    "reference",
    "通用行业知识库",
    "通用简历知识库：跨行业岗位族框架、通用量化维度与 JD 关键词识别法。当目标行业未匹配到专门行业知识库时读取，作为兜底。",
    () => import("./skill_industry_general").then((module) => module.industryGeneral()),
  ),
];
