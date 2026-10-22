import {
  configureResumeAiMessageProvider,
  configureResumeAiModelProvider,
  type ResumeAiMessageKey,
} from "@snowflake/resume-agent/host";
import type { ResumeAiAgent } from "@snowflake/resume-agent";
import { useAiStore } from "@/stores";
import { $t } from "@/locales";
import { getResumeParseLLM, getXiaoYangLLM, getXiaoZhouLLM } from ".";
import { registerResumeAgentSchema } from "@/views/resume/assistant/context/resumeSchemaProvider";

// 宿主接管简历 Agent 的模型、文案、字段契约与媒体声明，领域包不反向读取 Web 实现。
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
  // 每个稳定文案标识都必须有语言包映射，新增标识时由类型检查提醒补齐。
  const localeKeys: Record<ResumeAiMessageKey, string> = {
    aborted: "resumeAiAborted",
    streamNoRetry: "resumeAiStreamNoRetry",
    modelUnset: "resumeAiModelUnset",
    truncated: "resumeAiTruncated",
    emptyGeneration: "resumeAiEmptyGeneration",
    emptyAnswer: "resumeAiEmptyAnswer",
    markdownModelMissing: "resumeImportMarkdownModelMissing",
    pdfModelUnset: "resumeImportPdfModelUnset",
    requestTooLarge: "resumeImportRequestTooLarge",
  };
  // 请求错误文案继续跟随 Web 端当前语言设置。
  configureResumeAiMessageProvider({
    translate: (key, params) => $t(localeKeys[key], params),
  });
  registerResumeAgentSchema();
};
