import { $t } from "@/locales";
import { PDF_IMPORT_TASK, runResumeAiTask } from "@/views/resume/ai";
import { readResumeImportResult } from "./resumeImportNormalizer";
import { extractPdfImages } from "./pdfDocument";

// 使用现有解析角色直接请求模型，不经过项目服务器。
export const parsePdfResume = async (
  file: File,
  signal: AbortSignal,
  onProgress: (message: string) => void,
) => {
  const images = await extractPdfImages(file, signal, (page, total) => {
    onProgress($t("resumeImportReadingPdfPages", { page, total }));
  });
  signal.throwIfAborted();
  onProgress($t("resumeImportRecognizing"));
  return runResumeAiTask(
    PDF_IMPORT_TASK,
    { images },
    {
      signal,
      // 导入字段转换仍由简历导入模块负责
      parse: (response) => readResumeImportResult(response, onProgress),
    },
  );
};
