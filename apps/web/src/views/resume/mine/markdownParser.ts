import { $t } from "@/locales";
import { MARKDOWN_IMPORT_TASK, runResumeAiTask } from "@snowflake/resume-agent";
import { readResumeImportResult } from "./resumeImportNormalizer";

// 调用统一的简历 AI 任务使用方，返回可直接交给简历仓库创建的数据。
export const parseMarkdownResume = async (
  markdown: string,
  signal: AbortSignal = new AbortController().signal,
  onProgress: (message: string) => void = () => {},
) => {
  signal.throwIfAborted();
  if (!markdown.trim()) throw new Error($t("resumeImportMarkdownEmpty"));
  onProgress($t("resumeImportRecognizing"));
  return runResumeAiTask(MARKDOWN_IMPORT_TASK, { markdown }, {
    signal,
    // 导入字段转换仍由简历导入模块负责
    parse: (response) => readResumeImportResult(response, onProgress),
  });
};
