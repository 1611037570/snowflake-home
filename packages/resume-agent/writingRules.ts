import type { ContentAiAction } from "./types";

// 简历正文共用写作口径；单字段任务取当前类型，助手技能按需注入全量规则。

// 标题已说明类别，引导句是对标题的重复；总结句同为无信息量表述。
export const NO_INTRO_RULE =
  "正文直入主题，不重复模块标题或添加空泛开头、结尾。";

// 名词罗列与「分类标题：名词、名词」式堆砌是低级写法的通病，按颗粒度与岗位相关度组织。
export const NO_LISTING_RULE =
  "优先写清个人行动、方法和可验证结果；有岗位目标时突出相关事实，避免无说明的关键词堆砌。";

// 空转套话不承载任何信息。
export const NO_CLICHE_RULE = "不使用「系统学习」「在校期间」「相关知识」这类没有信息量的套话。";

// 语言风格约束：与类型规则叠加生效，两个出口都含本条。
export const LANGUAGE_STYLE_RULE = "使用自然、简洁的书面语，按内容选择段落或列表。";

// 使用方按自身提示词格式渲染，顺序即优先级。
export const RESUME_WRITING_DISCIPLINE: readonly string[] = [
  NO_INTRO_RULE,
  NO_LISTING_RULE,
  NO_CLICHE_RULE,
  LANGUAGE_STYLE_RULE,
];

// 起草经历类模块时，按事实决定段落与列表结构。
export const EXPERIENCE_GENERATE_RULE =
  "按真实职责组织经历；多项独立贡献可用 <ul><li> 分条，写清个人行动、方法与可验证结果。背景仅在有助于理解时交代，不为凑完整度编造数字或细节。";

// 不同字段类型的表达重心。
export const KIND_RULES: Record<string, string> = {
  // 经历字段保留职责与结果的对应关系。
  work: "突出个人职责、关键行动及可验证结果；多项独立贡献可分条。",
  project: "交代项目中的个人角色、关键行动与成果，避免把团队成果全部归于个人。",
  education: "补充与求职方向相关的课程、研究、项目或荣誉，避免重复已有学校、专业等字段。",
  // 技能字段说明可核对的掌握深度或应用场景。
  skill: "选择与目标相关且有依据的技能，说明掌握程度或实际应用；无需凑数量。",
  advantage: "用具体经历支撑与目标岗位相关的优势，不写空泛自评。",
  publication: "说明研究问题、方法、本人贡献及已有成果。",
  custom: "按模块用途和已有事实组织内容。",
};

// 分条列举规则只适用于工作、实习、项目、作品这类经历模块
const CAR_MODULES = new Set(["work", "internship", "project", "portfolio"]);

// 按操作与模块选择写作规则：生成经历类模块时按职责分条列举，其余沿用字段类型规则
export const getWritingRule = (action: ContentAiAction, kindKey: string, moduleKey: string): string => {
  if (action === "generate" && CAR_MODULES.has(moduleKey)) {
    return EXPERIENCE_GENERATE_RULE;
  }
  return KIND_RULES[kindKey] || "围绕已有事实客观描述，篇幅与内容相称。";
};

// 类型规则按模块展示名编组，助手侧按当前模块标题选用
const KIND_MODULE_LABELS: Record<string, string> = {
  work: "工作经历（实习、志愿、校园等经历类模块同此）",
  project: "项目经历",
  education: "教育经历",
  skill: "专业技能",
  advantage: "个人优势",
  publication: "学术论文",
  custom: "自定义模块",
};

// 助手侧按需注入共用规则，避免不同任务各写一套。
export const ASSISTANT_WRITING_RULES_TEXT = [
  `通用原则：${RESUME_WRITING_DISCIPLINE.join(" ")}`,
  `各类型规则（按当前模块选用）：${Object.entries(KIND_RULES)
    .map(([key, rule]) => `${KIND_MODULE_LABELS[key] ?? key}：${rule}`)
    .join("；")}`,
  `起草经历类模块（工作、实习、项目、作品）的新记录时：${EXPERIENCE_GENERATE_RULE}`,
].join("\n");
