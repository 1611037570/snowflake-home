export type ResumeTemplateOption = {
  key: string;
  value: string;
};

export type ResumeTemplateCategoryGroup = {
  key: string;
  name: string;
  icon: string;
  options: ResumeTemplateOption[];
};

export type ResumeTemplate = {
  fileName: string;
  name: string;
  description: string;
  scene: string[];
  industry: string[];
  position: string[];
  workExperience: string[];
  design: string[];
  tags: string[];
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

// 列表只保存模板索引和筛选信息，正文按文件名懒加载。
export const resumeTemplateList: ResumeTemplate[] = [
  {
    fileName: "xiaoZhou.ts",
    name: "通用简历",
    description: "适合通用求职场景的完整简历模板",
    scene: ["social-recruitment"],
    industry: ["all"],
    position: ["all"],
    workExperience: [],
    design: ["single-column"],
    tags: ["通用简历"],
  },
  {
    fileName: "xiaoYang.ts",
    name: "小羊",
    description: "适合前端开发岗位投递的项目经历简历模板",
    scene: ["social-recruitment"],
    industry: ["internet"],
    position: ["web-frontend"],
    workExperience: ["3-5"],
    design: ["single-column"],
    tags: ["前端开发", "项目经历"],
  },
  {
    fileName: "model__3-5__01.ts",
    name: "林妍",
    description: "适合平面与商业拍摄岗位展示的简历模板",
    scene: ["social-recruitment"],
    industry: ["culture-media", "advertising"],
    position: ["model"],
    workExperience: ["3-5"],
    design: ["single-column"],
    tags: ["商业拍摄", "作品展示"],
  },
  {
    fileName: "photo__3-5__01.ts",
    name: "摄影师简历",
    description: "适合商业摄影、品牌视觉与电商拍摄岗位的简历范本",
    scene: ["social-recruitment"],
    industry: ["culture-media", "advertising"],
    position: ["photographer"],
    workExperience: ["3-5"],
    design: ["single-column", "minimal"],
    tags: ["商业摄影", "视觉拍摄", "作品集"],
  },
  {
    fileName: "ve__3-5__01.ts",
    name: "视频剪辑师简历",
    description: "适合品牌短片、新媒体内容与影视后期岗位的简历范本",
    scene: ["social-recruitment"],
    industry: ["culture-media", "advertising"],
    position: ["video-editor"],
    workExperience: ["3-5"],
    design: ["single-column", "polished"],
    tags: ["视频剪辑", "影视后期", "作品集"],
  },
  {
    fileName: "pm__3-5__01.ts",
    name: "全字段产品经理简历",
    description: "覆盖个人信息、全部经历和作品模块的产品经理简历范本",
    scene: ["social-recruitment"],
    industry: ["internet"],
    position: ["product-manager"],
    workExperience: ["3-5"],
    design: ["single-column", "minimal"],
    tags: ["全字段", "产品经理", "信息分隔"],
  },
  {
    fileName: "fe__0__01.ts",
    name: "校园简历",
    description: "突出教育背景、课程项目与校园实践的校招简历模板",
    scene: ["campus"],
    industry: ["internet"],
    position: ["web-frontend"],
    workExperience: ["student"],
    design: ["single-column"],
    tags: ["校园招聘", "课程项目"],
  },
  {
    fileName: "op__0-1__01.ts",
    name: "实习简历",
    description: "突出实习职责、运营成果与可迁移技能的实习简历模板",
    scene: ["internship"],
    industry: ["all"],
    position: ["operation"],
    workExperience: ["0-1"],
    design: ["single-column"],
    tags: ["实习经历", "运营成果"],
  },
  {
    fileName: "all__0__01.ts",
    name: "升学简历",
    description: "突出成绩、科研课题与学术能力的国内升学简历模板",
    scene: ["further-education"],
    industry: ["all"],
    position: ["all"],
    workExperience: ["student"],
    design: ["single-column"],
    tags: ["国内升学", "科研经历"],
  },
  {
    fileName: "all__0__02.ts",
    name: "留学简历",
    description: "突出学术成绩、语言能力与实践经历的留学申请简历模板",
    scene: ["study-abroad"],
    industry: ["all"],
    position: ["all"],
    workExperience: ["student"],
    design: ["single-column"],
    tags: ["留学申请", "语言能力"],
  },
  {
    fileName: "fe__0-1__01.ts",
    name: "English Resume",
    description: "An English resume focused on skills, experience and project results.",
    scene: ["english-resume"],
    industry: ["internet"],
    position: ["web-frontend"],
    workExperience: ["0-1"],
    design: ["single-column"],
    tags: ["English", "Project Results"],
  },
];
