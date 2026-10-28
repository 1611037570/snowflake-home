import type { ResumeAiMessage, ResumeAiTask } from "../request/types";
import { CANDIDATE_COMPLETION_RULE, RESUME_WRITING_DISCIPLINE, getWritingRule } from "../writingRules";
import { findResumeModuleSchema } from "../schema/resumeSchemaRegistry";
import type { ContentAiAction } from "../types";

export type { ContentAiAction } from "../types";

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

// 输出契约固定为 HTML 片段，避免示例事实污染真实简历。
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
    "- moduleTitle 是当前模块标题，position 是求职方向；record 是其他表单字段，已有字段不在正文重复。",
    `- record 字段含义：${buildFieldHint(moduleKey) || "按字段名理解"}。`,
    "- currentText 是当前正文；生成时作参考，其余操作以此为处理对象。",
    "",
    "【写作要求】",
    "- 根据模块用途与求职方向决定侧重点；已确认的事实准确保留，未确认的候选内容明确标记。",
    // 除凝练外的操作共用候选规则，凝练仍只处理已有内容。
    ...(action === "simplify" ? [] : [`- ${CANDIDATE_COMPLETION_RULE}`]),
    // 写作纪律与 AI 助手链路共用同一份定义，禁止在提示词里另写一份
    ...RESUME_WRITING_DISCIPLINE.map((rule) => `- ${rule}`),
    `- 使用${language}输出，专有名词保留原文。`,
    `- ${getWritingRule(action, kindKey, moduleKey)}`,
    "",
    "【输出格式】",
    "只输出 HTML 片段，不加标题、说明或代码围栏；段落用 <p>，列表用 <ul>/<ol> 与 <li>，强调用 <strong>/<em>。",
    // 续写任务只返回增量，调用方负责保留原文并组装完整预览。
    ...(action === "continue" ? ["本次为续写，只输出追加的新增正文，不输出原文；原文由调用方保留。"] : []),
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
