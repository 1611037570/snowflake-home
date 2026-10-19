import type { ContentAiAction } from "@/views/resume/editor/panel/form/components/contentEditor/contentRewrite.task";

// 简历正文写作规则：富文本框单字段请求、AI 助手写操作两条链路共用的单一事实源。
// 任一侧需要规则时从此处取，禁止在各自提示词里另写一份导致口径漂移。
// 链路协议（流式契约、工具调用、报告格式）不属于本层，仍由各链路自行维护。

// 标题已说明类别，引导句是对标题的重复；总结句同为无信息量表述。
export const NO_INTRO_RULE =
  "不写称呼、自我介绍、前言、引导句与总结句；模块标题已说明类别，不要在正文中重复。";

// 名词罗列与「分类标题：名词、名词」式堆砌是低级写法的通病，按颗粒度与岗位相关度组织。
export const NO_LISTING_RULE =
  "默认每条写到「动作 + 方法或程度 + 结果」的颗粒度，按与目标岗位的相关度从高到低排列；禁止纯技术名、课程名、奖项名的罗列，禁止「分类标题：名词、名词」式堆叠。";

// 空转套话不承载任何信息。
export const NO_CLICHE_RULE = "不使用「系统学习」「在校期间」「相关知识」这类没有信息量的套话。";

// 使用方按自身提示词格式渲染，顺序即优先级。
export const RESUME_WRITING_DISCIPLINE: readonly string[] = [NO_INTRO_RULE, NO_LISTING_RULE, NO_CLICHE_RULE];

// 不同字段类型的写作要求：篇幅与表达重心
export const KIND_RULES: Record<string, string> = {
  // 一段经历通常有多项职责，按职责分条列举，单条职责才用一段
  work: "按职责分条：多条职责用无序列表 <ul><li> 逐条列举，每条以动词开头，落到具体动作与结果；只有一条职责时用一段；每条 30~60 字，没有数字时不要编造数字。",
  project: "按工作内容分条：多项内容用无序列表 <ul><li> 逐条列举，每条以动词开头，说明你的动作与可验证的结果；只有一项内容时用一段；每条 30~60 字，没有数字时不要编造数字。",
  education: "写 1~2 句、40~100 字，只写主修课程、在校荣誉、排名或项目，不要写学校、专业与学制。",
  // 技能条目写透技能名、掌握深度与应用场景；排序与禁罗列由通用纪律兜底
  skill: "用无序列表列举 6~8 条技能，每条写成「技能名称 + 掌握深度 + 应用场景或产出」的完整表述（如「Vue 3：独立负责中后台搭建，沉淀 20 余个通用组件」），每条 20~40 字；record 中未提供的深度与场景用【待补充：内容】占位，不要编造。",
  advantage: "写 2~3 句、60~120 字，概括与目标岗位匹配的核心竞争力。",
  publication: "写 2~3 句、60~120 字，说明研究问题、方法与本人承担的工作。",
  custom: "写 2~3 句、60~160 字，按该模块的事实客观描述，不套用其他模块的写法。",
};

// 分条列举规则只适用于工作、实习、项目、作品这类经历模块
const CAR_MODULES = new Set(["work", "internship", "project", "portfolio"]);

// 按操作与模块选择写作规则：生成经历类模块时按职责分条列举，其余沿用字段类型规则
export const getWritingRule = (action: ContentAiAction, kindKey: string, moduleKey: string): string => {
  if (action === "generate" && CAR_MODULES.has(moduleKey)) {
    // CAR 降为单条内部的句法：每条各自动作+结果，条与条之间用无序列表拆分
    return "一段经历通常包含多项职责：仅在有业务或项目背景时用一句 <p> 交代背景，不要用公司、职位、时间充当背景；其余职责一律用无序列表 <ul><li> 逐条列举，每条以动词开头，写清负责什么、怎么做的、用了什么技术或方法，并在同一条内给出量化或可验证的结果；每条 30~60 字，条数按 record 中的事实决定，通常 2~5 条；没有数字时不要编造数字；不得把所有职责合并成一段。";
  }
  return KIND_RULES[kindKey] || "写 2~3 句、60~160 字，围绕事实客观描述。";
};
