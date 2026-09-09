import type { ReactTool } from "@/apis/llm/react";
import type { ResumeToolContext } from "./tool_types";

// 支持更新简历展示语言的语言代码
export const RESUME_LANG_CODES = ["zh", "en", "ja", "ko", "fr", "de", "es", "ru"];

// 创建更新简历展示语言工具
export const createUpdateResumeLanguageTool = (ctx: ResumeToolContext): ReactTool => ({
  name: "update_resume_language",
  description:
    "更新简历的展示语言（控制模块标题、页脚等界面文案语言），翻译简历内容后调用，language 使用规范语言代码",
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
});
