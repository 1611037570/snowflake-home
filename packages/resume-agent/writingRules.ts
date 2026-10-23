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

// 目标岗位决定取舍，避免生成大量相似职责或空泛技能。
export const RESUME_QUALITY_RULE =
  "先确定求职目标与职业阶段，优先呈现最相关、最能体现个人贡献的经历；每条经历聚焦一个具体问题、本人做法与结果，避免重复岗位职责、堆砌技能词或给不同经历套同一段话。";

// 生成与优化共用候选内容规则：允许主动补全，但明确区分已知事实和待核实提案。
export const CANDIDATE_COMPLETION_RULE =
  "生成或优化简历时，输入简略也要依据已知岗位、行业和经历线索主动拟出完整的职责、行动、技术方案、成果表达及适用的量化候选，不只复述输入或留下空白。用户已提供的事实原样保留；模型补出的具体职责、技术、结果和数值须在对应表述后标记【待核实】，供用户逐项确认。姓名、公司、任职时间、学校、学历和证书等履历身份信息不得自行创造；缺少这些信息时留空。精简、翻译和问题修复任务不新增候选事实。";

// 使用方按自身提示词格式渲染，顺序即优先级。
export const RESUME_WRITING_DISCIPLINE: readonly string[] = [
  NO_INTRO_RULE,
  NO_LISTING_RULE,
  NO_CLICHE_RULE,
  LANGUAGE_STYLE_RULE,
  RESUME_QUALITY_RULE,
];

// 起草经历类模块时，按事实决定段落与列表结构。
export const EXPERIENCE_GENERATE_RULE =
  "按 CAR 组织经历：C 是背景与目标，A 是个人职责、行动和方法，R 是结果。多项独立贡献可用 <ul><li> 分条；每条经历先选择适用的处理量、效率、质量、成本等指标，结合已知线索写出完整的量化候选，未知数值可提出待核实的估计值或范围，不要只留指标名称。模型补出的职责、行动、技术、结果及数值按候选内容规则标记【待核实】，不得冒充已确认事实。";

// 精简只收缩已有内容，避免经历规则在该操作中引入候选事实。
export const EXPERIENCE_SIMPLIFY_RULE =
  "按 CAR 保留已有的背景、个人行动与结果，删除重复和空泛表述；不新增职责、技术、成果或数值。";

// 不同字段类型的表达重心。
export const KIND_RULES: Record<string, string> = {
  // 经历字段保留职责与结果的对应关系。
  work: "按 CAR 的背景、个人行动、结果写清工作经历；生成或优化时主动补全具体职责与量化候选，模型补出的内容标记【待核实】。多项独立贡献可分条。",
  project: "按 CAR 的背景、个人行动、结果写清项目经历；生成或优化时主动补全个人贡献与量化候选，模型补出的内容标记【待核实】，避免把团队成果全部归于个人。",
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
  if (action === "simplify" && CAR_MODULES.has(moduleKey)) {
    return EXPERIENCE_SIMPLIFY_RULE;
  }
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
  `候选内容：${CANDIDATE_COMPLETION_RULE}`,
  `各类型规则（按当前模块选用）：${Object.entries(KIND_RULES)
    .map(([key, rule]) => `${KIND_MODULE_LABELS[key] ?? key}：${rule}`)
    .join("；")}`,
  `起草经历类模块（工作、实习、项目、作品）的新记录时：${EXPERIENCE_GENERATE_RULE}`,
].join("\n");
