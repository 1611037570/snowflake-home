// 简历 AI 能力统一出口，页面与助手只通过本层调用请求、任务和领域能力。
export { getResumeAiModel, hasResumeAiModel } from "./request/client";
export {
  assertResumeAiResponseComplete,
  createResumeAiReactRunner,
  readResumeAiResponseText,
  runResumeAiTask,
} from "./request";
export type {
  ResumeAiAgent,
  ResumeAiMessage,
  ResumeAiProtocol,
  ResumeAiTask,
  RunResumeAiTaskOptions,
} from "./request";
export { useResumeContext } from "./context/resumeContext";
export { normalizeRichTextHtml } from "./format/normalizeRichText";
export { RICH_TEXT_SANITIZE_CONFIG } from "./format/richTextSanitize";
export { RESUME_SCHEMA, findResumeModuleSchema } from "./schema/resumeSchemaRegistry";
export type { ResumeFieldSchema, ResumeModuleSchema } from "./schema/resumeSchema";
export { CONTENT_REWRITE_TASK, LANGUAGE_NAMES } from "./tasks/contentRewrite";
export type { ContentRewriteInput } from "./tasks/contentRewrite";
export { runInitialResumeGeneration } from "./tasks/initialResumeGeneration";
export type {
  InitialResumeGenerationInput,
  InitialResumeGenerationStage,
  RunInitialResumeGenerationOptions,
} from "./tasks/initialResumeGeneration";
export type { ContentAiAction, Skill, SkillFactory, SkillLoader, SkillRole } from "./types";
export { MARKDOWN_IMPORT_TASK, PDF_IMPORT_TASK } from "./tasks/importResume";
export { MAX_PDF_REQUEST_BYTES } from "./tasks/pdfLimits";
export { GENERAL_CHAT_TASK, RESUME_CHAT_TASK } from "./tasks/chat";
export type { ResumeChatInput } from "./tasks/chat";
export { useInterviewQuickAnswer } from "./tasks/interviewQuickAnswer";
export { ASSISTANT_REFLECT_PROMPT } from "./prompts/assistant";
export { createDefaultAssistantPrompt } from "./prompts/defaultAssistant";
export { createResumeTools, RESUME_LANG_CODES } from "./tools";
export type { ResumeToolContext } from "./tools";
export { createSkillReferenceTool } from "./tools/skillLoader";
export { buildToolGuide } from "./tools/toolGuide";
export { createResumeAgentTaskRuntime } from "./runtime/resumeAgentTask";
export { RESUME_AGENT_FACTS } from "./runtime/types";
export type {
  CreateResumeAgentTaskRuntimeOptions,
  ResumeAgentPendingInput,
  ResumeAgentTaskBlocker,
  ResumeAgentTaskEvidence,
  ResumeAgentTaskPhase,
  ResumeAgentTaskProfile,
  ResumeAgentTaskRelation,
  ResumeAgentTaskState,
} from "./runtime/resumeAgentTask";
export type {
  ResumeAgentCompletionPolicy,
  ResumeAgentEvidenceKind,
  ResumeAgentEvidenceOrder,
  ResumeAgentRequiredEffect,
  ResumeAgentTool,
  ResumeAgentToolEffect,
  ResumeAgentToolEvaluation,
  ResumeAgentToolResultStatus,
  ResumeAgentToolReplayScope,
  ResumeAgentToolRuntimeMeta,
} from "./runtime/types";
export {
  parseResumeReport,
  stripResumeReportBlock,
} from "./reports/resumeReport";
