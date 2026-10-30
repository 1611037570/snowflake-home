import {
  configureResumeAiMessageProvider,
  configureResumeAiModelProvider,
  type ResumeAiMessageKey,
} from "@snowflake/resume-agent/host";
import type { ResumeAiAgent } from "@snowflake/resume-agent";
import { useAiStore } from "@/stores";
import { $t } from "@/locales";
import { getResumeParseLLM, getXiaoZhouLLM } from ".";

// 宿主只接管简历智能体的模型与文案，公共简历字段独立注册。
export const registerResumeAgentHost = () => {
  configureResumeAiModelProvider({
    getModel: (agent: ResumeAiAgent) => {
      // 简历业务只使用小舟与解析角色，不接入面试官小羊。
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
    timeout: "resumeAiTimeout",
    rateLimited: "resumeAiRateLimited",
    serverError: "resumeAiServerError",
    network: "resumeAiNetwork",
    unknown: "resumeAiUnknown",
    incompleteTask: "resumeAiIncompleteTask",
    contextOverflow: "resumeAiContextOverflow",
    markdownModelMissing: "resumeImportMarkdownModelMissing",
    pdfModelUnset: "resumeImportPdfModelUnset",
    requestTooLarge: "resumeImportRequestTooLarge",
  };
  // 请求错误文案继续跟随 Web 端当前语言设置。
  configureResumeAiMessageProvider({
    translate: (key, params) => $t(localeKeys[key], params),
  });
};
