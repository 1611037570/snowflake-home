import { $t } from "@/locales";
import { getResumeParseLLM } from "@/apis";
import { runResumeAiTask } from "@/views/resume/ai/request";
import { PDF_IMPORT_TASK } from "./importResume.task";
import { readResumeImportResult } from "./resumeImportNormalizer";
import { extractPdfImages } from "./pdfDocument";

// 使用现有解析角色直接请求模型，不经过项目服务器。
export const parsePdfResume = async (
  file: File,
  signal: AbortSignal,
  onProgress: (message: string) => void,
) => {
  const llm = getResumeParseLLM();
  if (!llm?.apiKey || !llm.url || !llm.model) {
    throw new Error($t("resumeImportPdfModelUnset"));
  }
  const images = await extractPdfImages(file, signal, (page, total) => {
    onProgress($t("resumeImportReadingPdfPages", { page, total }));
  });
  signal.throwIfAborted();
  onProgress($t("resumeImportRecognizing"));
  return runResumeAiTask(
    PDF_IMPORT_TASK,
    { images, model: llm.model },
    {
      // 复用已解析的解析模型，任务内只负责按协议组装请求体
      llm,
      signal,
      // 导入字段转换仍由简历导入模块负责
      parse: (response) => readResumeImportResult(response, onProgress),
    },
  );
};
