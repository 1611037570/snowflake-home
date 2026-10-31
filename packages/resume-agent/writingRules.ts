import type { ContentAiAction } from "./types";

// 简历正文共用写作口径；单字段任务取当前类型，助手技能按需注入全量规则。

// 操作语义由字段任务与助手共用，界面入口不维护独立提示词。
export const CONTENT_ACTION_RULES: Record<ContentAiAction, {
  // 用于向模型说明用户选择的处理目标。
  name: string;
  // 与界面及输出格式无关的正文处理规则。
  instruction: string;
}> = {
  generate: {
    name: "生成", // 根据已有资料起草正文。
    instruction: "根据已有资料重新组织正文，原文只作参考，不要照抄；可按候选内容规则补全。", // 起草时允许重组与补全。
  },
  continue: {
    name: "续写", // 在已有正文后补充内容。
    instruction: "保留原文的内容、顺序与结构，只在末尾接续新的内容，衔接原文语气与主题，不重复已有表述；新增内容按候选内容规则处理。写回完整字段时保留原文并追加续写部分。", // 续写不改写原文。
  },
  polish: {
    name: "更专业", // 改善专业表达。
    instruction: "保留原文已确认的事实与条目结构，改善专业用词、行动与成果的表达，避免术语堆砌和夸大；按候选内容规则补全可核实的贡献，不以增加篇幅为目标。", // 专业改写优先改善表达。
  },
  simplify: {
    name: "更凝练", // 缩短已有正文。
    instruction: "精简原文，保留关键事实、职责、行动与成果，删去套话和重复，保留条目结构；不新增职责、技术、成果或数值。", // 凝练仅处理已有内容。
  },
  expand: {
    name: "更详细", // 展开已有正文中的信息。
    instruction: "围绕原文展开背景、个人行动、方法与成果，保留已确认的事实和条目结构，增加有用细节而非重复改述；补充内容遵循候选内容规则，不引入无关经历。", // 扩写围绕已有主题补充细节。
  },
};

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
  "结合求职目标与职业阶段决定经历的取舍和篇幅，优先呈现能体现个人贡献的内容；避免重复职责、堆砌技能词或给不同经历套同一段话。";

// 可选字段的操作边界由所有生成、改写和优化入口共用。
export const OPTIONAL_FIELD_RULE =
  "可选字段默认不补。仅当前记录已有实际内容，或用户明确提供该字段资料、指定处理或在该字段上发起操作时，才按本次目标操作。字段存在、空值和默认值不代表已使用，笼统的生成或优化不算指定。未使用且未指定的字段不提交内容或 XX，也不从其他记录复制可选字段。";

// 生成与优化共用候选内容规则：允许主动补全，未知细节统一使用简短占位。
export const CANDIDATE_COMPLETION_RULE =
  "生成或优化简历时，在本次允许操作的字段范围内，即使资料简略，也应结合求职目标、行业与已有线索主动起草具体职责、行动、技术方案和成果候选，形成完整可编辑的内容；优先使用已知事实，未知的具体名称、数值与成果细节使用 XX 占位，不在整条经历末尾添加提示语。量化能增强说服力时可使用 XX 表示尚未确认的指标值；不为凑数字编写无关指标。姓名、公司、任职时间、学校、学历和证书等身份资料以用户提供或简历中明确对应的事实为准，不虚构具体身份事实；起草时，未知的自由文本身份字段可使用 XX 占位，未知日期与未确认的枚举字段留空或不提交，不把表单必填等同于生成前必须追问。精简、翻译和问题修复只处理已有内容。";

// 所有简历编写场景统一处理空内容，不把资料收集作为生成前置条件。
export const DRAFT_REQUEST_RULE =
  "简历编写、补充或新增时，仅在目标必填字段和允许操作的可选字段范围内，有内容就改、没有内容直接起草，不以收齐资料或再次确认为前置。保留已知事实，未知自由文本用 XX，未知日期与未确认枚举留空或不提交，不编造具体身份或已获成果，不在经历末尾添加提示语。只有操作对象或范围无法由上下文确定时才追问；精简、翻译和问题修复不凭空新增经历。";

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
  "可用 CAR 梳理经历：C 是背景与目标，A 是个人职责和行动，R 是结果；正文按最有说服力的事实安排顺序，不显示框架标签。多项独立贡献可用 <ul><li> 分条；量化能增强表达时可在未知数值处使用 XX，具体交付更有说服力时直接写交付；不在条目末尾添加提示语。";

// 精简只收缩已有内容，避免经历规则在该操作中引入候选事实。
export const EXPERIENCE_SIMPLIFY_RULE =
  "保留已有的背景、个人行动与结果，删除重复和空泛表述；不新增职责、技术、成果或数值。";

// 不同字段类型的表达重心。
export const KIND_RULES: Record<string, string> = {
  // 经历字段保留职责与结果的对应关系。
  work: "优先突出个人负责的业务、关键做法与成果；生成或优化时可补全候选，未知细节使用 XX 占位。多项独立贡献可分条。",
  project: "交代项目目标、个人角色与关键贡献；生成或优化时可补全候选，未知细节使用 XX 占位，避免把团队成果全部归于个人。",
  education: "补充与求职方向相关的课程、研究、项目或荣誉，避免重复已有学校、专业等字段。",
  // 技能字段说明可核对的掌握深度或应用场景。
  skill: "选择与目标相关且有依据的技能，说明掌握程度或实际应用；无需凑数量。",
  advantage: "用具体经历支撑与目标岗位相关的优势，不写空泛自评。",
  publication: "说明研究问题、方法、本人贡献及已有成果。",
  custom: "按模块用途和已有事实组织内容。",
};

// 分条列举规则只适用于工作、实习、项目、作品这类经历模块
const CAR_MODULES = new Set(["work", "internship", "project", "portfolio"]);

// 按操作与模块选择写作规则：生成经历类模块时灵活组织贡献，其余沿用字段类型规则。
export const getWritingRule = (action: ContentAiAction, kindKey: string, moduleKey: string): string => {
  // 操作规则与模块写法在同一出口组合，避免入口各自解释操作语义。
  const actionRule = CONTENT_ACTION_RULES[action].instruction;
  if (action === "simplify" && CAR_MODULES.has(moduleKey)) {
    return `${actionRule} ${EXPERIENCE_SIMPLIFY_RULE}`;
  }
  if (action === "generate" && CAR_MODULES.has(moduleKey)) {
    return `${actionRule} ${EXPERIENCE_GENERATE_RULE}`;
  }
  return `${actionRule} ${KIND_RULES[kindKey] || "围绕已有事实客观描述，篇幅与内容相称。"}`;
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
  // 助手按用户意图选用同一套操作规则，不依赖富文本按钮。
  `正文处理（按用户指定目标选用，未指定时根据本轮目标判断）：${Object.values(CONTENT_ACTION_RULES)
    .map(({ name, instruction }) => `${name}：${instruction}`)
    .join("；")}`,
  `各类型规则（按当前模块选用）：${Object.entries(KIND_RULES)
    .map(([key, rule]) => `${KIND_MODULE_LABELS[key] ?? key}：${rule}`)
    .join("；")}`,
  `起草经历类模块（工作、实习、项目、作品）的新记录时：${EXPERIENCE_GENERATE_RULE}`,
].join("\n");
