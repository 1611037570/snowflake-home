import type { ResumeAgentTool } from "../runtime/types";
import { TOOL_ARGUMENT_RULE } from "./promptRules";
import type { ResumeToolContext } from "./tool_types";

// 支持更新简历展示语言的语言代码
export const RESUME_LANG_CODES = ["zh", "en", "ja", "ko", "fr", "de", "es", "ru"];

// 创建更新简历展示语言工具
export const createUpdateResumeLanguageTool = (ctx: ResumeToolContext): ResumeAgentTool => ({
  name: "update_resume_language",
  description:
    `${TOOL_ARGUMENT_RULE}\n\n仅同步简历展示语言，不会翻译或写入任何简历字段。本次请求必须先通过 propose_resume_edits 成功写入翻译内容，否则调用会被拒绝。language 使用规范语言代码`,
  parameters: {
    type: "object",
    properties: {
      language: {
        type: "string",
        description:
          "规范语言代码：zh 中文 / en 英语 / ja 日语 / ko 韩语 / fr 法语 / de 德语 / es 西班牙语 / ru 俄语",
      },
    },
    required: ["language"],
  },
  execute: (args: any) => {
    const language = args?.language;
    const updated = RESUME_LANG_CODES.includes(language) && (ctx.updateLanguage?.(language) ?? false);
    return updated ? { updated: true } : { updated: false };
  },
  taskMeta: {
    effect: "sync", // 该工具同步简历展示状态。
    evidenceKind: "language_update", // 成功后生成展示语言同步证据。
    replayScope: "state", // 简历数据变化后允许重新同步相同语言。
    requiresEvidence: ["resume_change"], // 翻译内容完整写入后才允许同步展示语言。
    // 展示语言实际更新后才生成同步完成证据。
    evaluate: (result) => {
      const success = Boolean(result && typeof result === "object" && "updated" in result &&
        (result as Record<string, unknown>).updated === true
      );
      return {
        status: success ? "success" : "failed",
        summary: success ? "已同步简历展示语言" : "未能同步简历展示语言",
      };
    },
  },
});
