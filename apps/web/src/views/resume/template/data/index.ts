import { xiaoZhouResumeTemplate } from "./characters/xiaoZhou";
import { furtherEducationResumeTemplate } from "./items/all__0__01";
import { studyAbroadResumeTemplate } from "./items/all__0__02";
import { englishResumeTemplate } from "./items/fe__0-1__01";
import { campusZeroToOneResumeTemplate } from "./items/fe__0__01";
import { modelResumeTemplate } from "./items/model__3-5__01";
import { internshipZeroToOneResumeTemplate } from "./items/op__0-1__01";
import { photographerResumeTemplate } from "./items/photo__3-5__01";
import { videoEditorResumeTemplate } from "./items/ve__3-5__01";
import { xiaoYangProgrammerResumeTemplate } from "./characters/xiaoYang";

type ResumeTemplateOption = {
  key: string;
  value: string;
};

type ResumeTemplateCategoryGroup = {
  key: string;
  name: string;
  icon: string;
  options: ResumeTemplateOption[];
};

type ResumeTemplateItem = {
  data: Record<string, unknown>;
  config: Record<string, unknown>;
  ui: Record<string, unknown>;
};

export type ResumeTemplate = {
  id: string;
  name: string;
  description: string;
  scene: string[];
  industry: string[];
  position: string[];
  workExperience: string[];
  design: string[];
  tags: string[];
  item: ResumeTemplateItem;
};

export const resumeTemplateSceneOptions: ResumeTemplateOption[] = [
  { key: "social-recruitment", value: "社会招聘" },
  { key: "campus", value: "校园招聘" },
  { key: "internship", value: "实习" },
  { key: "further-education", value: "国内升学" },
  { key: "study-abroad", value: "留学申请" },
  { key: "english-resume", value: "英文模板" },
];

export const resumeTemplateIndustryOptions: ResumeTemplateOption[] = [
    { key: "all", value: "不限行业" },
    // 互联网/科技
    { key: "internet", value: "互联网/IT" },
    { key: "ecommerce", value: "电子商务" },
    { key: "telecommunication", value: "通信" },
    { key: "gaming", value: "游戏" },
    // 金融/专业服务
    { key: "finance", value: "金融" },
    { key: "bank", value: "银行" },
    { key: "insurance", value: "保险" },
    { key: "consulting", value: "咨询" },
    { key: "legal", value: "法律" },
    { key: "professional-services", value: "专业服务" },
    // 消费/传媒/教育
    { key: "culture-media", value: "文化/传媒" },
    { key: "advertising", value: "广告" },
    { key: "education-training", value: "教育培训" },
    { key: "retail", value: "零售/快消" },
    { key: "tourism", value: "旅游/酒店" },
    // 制造/基建/交通
    { key: "manufacturing", value: "制造业" },
    { key: "automobile", value: "汽车" },
    { key: "real-estate", value: "房地产/建筑" },
    { key: "logistics", value: "仓储/物流" },
    { key: "transportation", value: "交通/运输" },
    { key: "energy", value: "能源/环保" },
    // 医疗/公共/其他
    { key: "healthcare", value: "医疗/健康" },
    { key: "pharmaceutical", value: "医药/制药" },
    { key: "government", value: "政府/公共事业" },
    { key: "agriculture", value: "农业/食品" },
    { key: "other", value: "其他" },
];

export const resumeTemplatePositionOptions: ResumeTemplateOption[] = [
    { key: "all", value: "不限职位" },
    // 技术
    { key: "web-frontend", value: "Web前端" },
    { key: "java", value: "Java" },
    { key: "python", value: "Python" },
    { key: "javascript", value: "JavaScript" },
    { key: "android", value: "Android" },
    { key: "ios", value: "iOS" },
    { key: "dotnet-engineer", value: ".NET工程师" },
    { key: "csharp-engineer", value: "C#工程师" },
    { key: "testing", value: "测试" },
    { key: "devops", value: "运维" },
    { key: "big-data", value: "大数据" },
    { key: "algorithm-engineer", value: "算法工程师" },
    { key: "data-analysis", value: "数据分析" },
    { key: "cyber-security", value: "网络安全" },
    { key: "embedded", value: "嵌入式" },
    // 产品/设计
    { key: "product-manager", value: "产品经理" },
    { key: "ui-ux", value: "UI/UX" },
    { key: "graphic-design", value: "平面设计/美工" },
    { key: "model", value: "模特" },
    { key: "photographer", value: "摄影师" },
    { key: "video-editor", value: "视频剪辑" },
    // 运营/市场
    { key: "operation", value: "运营" },
    { key: "new-media", value: "新媒体" },
    { key: "copywriting-planning", value: "文案/策划" },
    { key: "seo-sem", value: "SEO/SEM" },
    { key: "marketing", value: "市场/营销" },
    { key: "public-relations", value: "品牌公关" },
    { key: "event-planning", value: "会展策划" },
    // 销售/商务
    { key: "sales", value: "销售" },
    { key: "business-development", value: "商务拓展" },
    { key: "foreign-trade", value: "外贸" },
    { key: "procurement-trade", value: "采购贸易" },
    // 职能
    { key: "human-resources", value: "人力资源" },
    { key: "administration", value: "行政" },
    { key: "accounting", value: "财务" },
    { key: "teacher", value: "教师" },
    { key: "other", value: "其他" },
];

export const resumeTemplateWorkExperienceOptions: ResumeTemplateOption[] = [
    { key: "student", value: "在校学生" },
    { key: "0-1", value: "0-1年" },
    { key: "1-3", value: "1-3年" },
    { key: "3-5", value: "3-5年" },
    { key: "5-10", value: "5-10年" },
    { key: "10+", value: "10年以上" },
];

export const resumeTemplateDesignOptions: ResumeTemplateOption[] = [
    { key: "single-column", value: "单栏" },
    { key: "two-column", value: "双栏" },
    { key: "minimal", value: "简约" },
    { key: "timeline", value: "时间轴" },
  { key: "polished", value: "精美" },
];

export const resumeTemplateCategoryGroups: ResumeTemplateCategoryGroup[] = [
  { key: "scene", name: "热门模板", icon: "lucide:flame", options: resumeTemplateSceneOptions },
  { key: "industry", name: "行业", icon: "lucide:building-2", options: resumeTemplateIndustryOptions },
  { key: "position", name: "职位", icon: "lucide:briefcase-business", options: resumeTemplatePositionOptions },
  { key: "design", name: "设计", icon: "lucide:palette", options: resumeTemplateDesignOptions },
  { key: "style", name: "简历模板", icon: "lucide:layout-template", options: [] },
];

export const resumeTemplateHotList: ResumeTemplate[] = [
  xiaoZhouResumeTemplate,
  xiaoYangProgrammerResumeTemplate,
  modelResumeTemplate,
  photographerResumeTemplate,
  videoEditorResumeTemplate,
  campusZeroToOneResumeTemplate,
  internshipZeroToOneResumeTemplate,
  furtherEducationResumeTemplate,
  studyAbroadResumeTemplate,
  englishResumeTemplate,
];

export const resumeTemplateList: ResumeTemplate[] = [...resumeTemplateHotList];
