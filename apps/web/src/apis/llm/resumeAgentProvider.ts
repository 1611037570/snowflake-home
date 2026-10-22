import {
  configureResumeAiMessageProvider,
  configureResumeAiModelProvider,
  type ResumeAiAgent,
} from "@snowflake/resume-agent";
import { useAiStore } from "@/stores";
import { $t } from "@/locales";
import { getResumeParseLLM, getXiaoYangLLM, getXiaoZhouLLM } from ".";
import { registerResumeAgentSchema } from "@/views/resume/assistant/context/resumeSchemaProvider";

// 注册简历 Agent 使用的模型、文案与字段契约宿主能力。
export const registerResumeAgentHost = () => {
  configureResumeAiModelProvider({
    getModel: (agent: ResumeAiAgent) => {
      if (agent === "xiaoYang") return getXiaoYangLLM();
      if (agent === "resumeParser") return getResumeParseLLM();
      return getXiaoZhouLLM();
    },
    hasModel: (agent: ResumeAiAgent) => {
      const aiStore = useAiStore();
      const modelId = aiStore.getAgentModelId(agent);
      const model = aiStore.modelList.find((item) => item.id === modelId);
      return Boolean(model?.provider && model.key && model.url && model.model);
    },
  });
  // 请求错误文案继续跟随 Web 端当前语言设置。
  configureResumeAiMessageProvider({
    translate: (key, params) => {
      const localeKeys = {
        aborted: "resumeAiAborted",
        streamNoRetry: "resumeAiStreamNoRetry",
        modelUnset: "resumeAiModelUnset",
        truncated: "resumeAiTruncated",
        markdownModelMissing: "resumeImportMarkdownModelMissing",
        pdfModelUnset: "resumeImportPdfModelUnset",
        requestTooLarge: "resumeImportRequestTooLarge",
      } as const;
      return $t(localeKeys[key], params);
    },
  });
  registerResumeAgentSchema();
};
