import type { ResumeAiMessage, ResumeAiTask } from "@/views/resume/ai/request/types";
import { findResumeModuleSchema } from "@/views/resume/editor/assistant/resumeSchemaRegistry";

// 当前正文支持的操作类型
export type ContentAiAction = "generate" | "polish" | "simplify";

// 三种操作各自的处理方式，差异只体现在对待处理正文的改法
const ACTION_INSTRUCTIONS: Record<ContentAiAction, string> = {
  generate: "根据数据重写这段正文，currentText 只作参考，不要照抄",
  polish: "在信息不变的前提下润色 currentText，改善专业表达与信息密度",
  simplify: "精简 currentText，保留关键职责、行动与成果，删去套话与重复",
};

// 不同字段类型的写作要求：篇幅与表达重心
const KIND_RULES: Record<string, string> = {
  work: "写 2~3 句、80~160 字，每条职责落到具体动作与结果，没有数字时不要编造数字。",
  project: "写 2~3 句、80~160 字，说明项目目标、你的动作与可验证的结果。",
  education: "写 1~2 句、40~100 字，只写主修课程、在校荣誉、排名或项目，不要写学校、专业与学制。",
  skill: "用 6~10 条短句分组列举能力，用无序列表，每条不超过 20 字。",
  advantage: "写 2~3 句、60~120 字，概括与目标岗位匹配的核心竞争力。",
  publication: "写 2~3 句、60~120 字，说明研究问题、方法与本人承担的工作。",
  custom: "写 2~3 句、60~160 字，按该模块的事实客观描述，不套用其他模块的写法。",
};

// 简历展示语言与输出语言名称的对应关系
export const LANGUAGE_NAMES: Record<string, string> = {
  zh: "中文",
  en: "英文",
  ja: "日文",
  ko: "韩文",
  fr: "法文",
  de: "德文",
  es: "西班牙文",
  ru: "俄文",
};

// CAR 法则只适用于工作、实习、项目、作品这类经历模块
const CAR_MODULES = new Set(["work", "internship", "project", "portfolio"]);

// 按操作与模块选择写作规则：生成经历类模块时用 CAR 结构，其余沿用字段类型规则
const getWritingRule = (action: ContentAiAction, kindKey: string, moduleKey: string) => {
  if (action === "generate" && CAR_MODULES.has(moduleKey)) {
    return "按 CAR 组织正文：有业务或项目背景时先用一句交代（Context），不要用公司、职位、时间充当背景；核心写行动（Action：负责什么、怎么做的、用了什么技术或方法）；最后给出结果（Result：量化或可验证的成果）；总长 80~160 字。";
  }
  return KIND_RULES[kindKey] || "写 2~3 句、60~160 字，围绕事实客观描述。";
};

// 生成当前模块的字段说明，避免模型靠字段名猜含义
const buildFieldHint = (moduleKey: string) => {
  // 正文编辑器始终使用模块对象形态，避免混入同模块的列表字段
  const module = findResumeModuleSchema(moduleKey, {});
  if (!module?.fields.length) return "";
  return module.fields
    .map(
      (field) =>
        `${field.key}（${field.label}${field.format === "month" ? "，格式 YYYY.MM" : ""}）`,
    )
    .join("、");
};

// 输出契约固定为 HTML 片段，用示例约束模型的实际输出
const buildSystemPrompt = (
  action: ContentAiAction,
  kindKey: string,
  moduleKey: string,
  moduleTitle: string,
  language: string,
) =>
  [
    "你只负责写简历中的「正文」这一栏。",
    "",
    "【输入说明】",
    "- moduleTitle：当前模块标题（如工作经历、教育经历、技能、荣誉证书），决定写作口径。",
    "- position：求职方向，决定写法与侧重点。",
    "- record：表单的其他栏位（单位、职位、学校、专业、时间等），只用于理解这段经历，不是正文素材。",
    `- record 字段含义：${buildFieldHint(moduleKey) || "按字段名理解"}。`,
    "- currentText：当前正文，生成时仅作参考，润色与精简时作为改写对象。",
    "- 正文只补充 record 之外的信息：职责、行动、成果、课程、荣誉。",
    "",
    "【写作要求】",
    "- 按 moduleTitle 判断当前模块的类型，使用对应写法，不要套用其他模块的口径。",
    "- 只使用输入中的事实，不编造单位、职位、技术、时间、数字与成果；缺失时用【待补充：缺失内容】占位。",
    "- 简洁书面语，动词开头，不使用第一人称，不写称呼、自我介绍与总结句。",
    "- 不使用「系统学习」「在校期间」「相关知识」这类没有信息量的套话。",
    `- ${ACTION_INSTRUCTIONS[action]}`,
    `- 使用${language}输出，专有名词保留原文。`,
    `- ${getWritingRule(action, kindKey, moduleKey)}`,
    "",
    "【输出格式】",
    "只输出 HTML，第一个字符必须是 <，最后一个字符必须是 >。",
    "- 每个段落用 <p>...</p> 包裹。",
    "- 需要强调时用 <strong>...</strong>。",
    "- 并列要点用 <ul><li>...</li></ul>，有序步骤用 <ol><li>...</li></ol>。",
    "- 禁止输出 Markdown 符号（如 **、-、#、编号）、代码围栏、标题、解释或任何前后缀。",
    "- 禁止使用 <h1>~<h6>、<div>、<table>、<img>、<a>、<html>、<body> 与 style 属性。",
    "",
    "【示例】",
    '输入：{"moduleTitle":"工作经历","position":"前端工程师","module":"work","record":{"company":"字节跳动","title":"前端工程师","startTime":"2021.03"},"currentText":"负责官网改版，加载时间从 3.2s 降到 1.1s"}',
    "输出：<p>主导官网改版：基于 React 重构首屏加载链路，将首屏加载时间从 3.2s 降至 1.1s。</p>",
  ].join("\n");

// 正文字段任务输入：业务侧收集的事实与本次操作
export type ContentRewriteInput = {
  // 本次操作类型
  action: ContentAiAction;
  // 当前字段类型
  kindKey: string;
  // 当前模块标识
  moduleKey: string;
  // 当前模块标题
  moduleTitle: string;
  // 输出语言
  language: string;
  // 提供给模型的字段事实
  payload: Record<string, unknown>;
};

// 正文字段任务：流式返回，由使用方累积并预览
export const CONTENT_REWRITE_TASK: ResumeAiTask<ContentRewriteInput> = {
  // 正文处理使用小舟模型
  agent: "xiaoZhou",
  // 边生成边展示预览
  stream: true,
  // 不自动重复生成多份结果
  retryCount: 0,
  // 正文处理不生成推理过程
  extraOptions: { thinking: { type: "disabled" } },
  // 提示词全部放在系统消息，业务数据作为用户消息
  buildMessages: (input): ResumeAiMessage[] => [
    {
      role: "system",
      content: buildSystemPrompt(
        input.action,
        input.kindKey,
        input.moduleKey,
        input.moduleTitle,
        input.language,
      ),
    },
    {
      role: "user",
      content: JSON.stringify(input.payload, null, 2),
    },
  ],
};
