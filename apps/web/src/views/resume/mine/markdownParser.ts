import { runResumeAiTask } from "@/views/resume/ai/request";
import { MARKDOWN_IMPORT_TASK } from "./importResume.task";
import { readResumeImportResult } from "./resumeImportNormalizer";

// 调用统一的简历 AI 任务使用方，返回可直接交给简历仓库创建的数据。
export const parseMarkdownResume = async (
  markdown: string,
  signal: AbortSignal = new AbortController().signal,
  onProgress: (message: string) => void = () => {},
) => {
  signal.throwIfAborted();
  if (!markdown.trim()) throw new Error("Markdown 文件内容为空");
  onProgress("正在识别简历内容，请稍候");
  return runResumeAiTask(MARKDOWN_IMPORT_TASK, { markdown }, {
    signal,
    // 导入字段转换仍由简历导入模块负责
    parse: (response) => readResumeImportResult(response, onProgress),
  });
};
