import type { ReactTool } from "@/apis/llm/react";

export const RESUME_AGENT_FACTS = {
  resumeIssuesResolved: "resume_issues_resolved", // 当前简历检查已没有剩余问题。
} as const;

export type ResumeAgentEvidenceKind =
  // 当前任务的资料读取操作。
  | "read"
  // 当前简历的数据修改操作。
  | "resume_change"
  // 独立简历草稿的提交操作。
  | "draft_submit"
  // 简历展示语言的同步操作。
  | "language_update";

export type ResumeAgentToolResultStatus =
  // 工具完整完成了本次操作。
  | "success"
  // 工具只完成了部分操作，仍需继续处理。
  | "partial"
  // 工具没有完成任何有效操作。
  | "failed";

export type ResumeAgentToolEvaluation = {
  // 工具本次执行的完成状态。
  status: ResumeAgentToolResultStatus;
  // 提供给任务记录和模型观察的简短结果摘要。
  summary: string;
  // 本次结果额外证明的业务事实，由特定能力按需要求。
  facts?: string[];
};

export type ResumeAgentToolEffect =
  // 工具只读取资料，不改变业务状态。
  | "read"
  // 工具修改当前简历数据。
  | "mutation"
  // 工具提交独立结果。
  | "submit"
  // 工具同步写入后的界面或展示状态。
  | "sync";

export type ResumeAgentToolReplayScope =
  // 相同参数在整个任务内复用首次结果。
  | "task"
  // 相同参数只在当前简历数据版本内复用首次结果。
  | "state"
  // 每次调用都重新执行工具。
  | "none";

export type ResumeAgentToolRuntimeMeta = {
  // 工具对任务产生的效果类型。
  effect: ResumeAgentToolEffect;
  // 工具执行后生成的证据类型。
  evidenceKind: ResumeAgentEvidenceKind;
  // 成功或部分成功后是否使之前的读取结果失效。
  invalidatesRead?: boolean;
  // 相同参数重复调用时的结果复用范围。
  replayScope?: ResumeAgentToolReplayScope;
  // 根据业务结果判断完整成功、部分成功或失败。
  evaluate: (result: unknown) => ResumeAgentToolEvaluation;
};

export type ResumeAgentTool = ReactTool & {
  // 仅供任务运行时使用的效果元数据，不会发送给模型。
  taskMeta?: ResumeAgentToolRuntimeMeta;
};

export type ResumeAgentEvidenceOrder = {
  // 必须后执行并成功的证据类型。
  evidence: ResumeAgentEvidenceKind;
  // 必须先执行并成功的证据类型。
  after: ResumeAgentEvidenceKind;
};

export type ResumeAgentCompletionPolicy = {
  // 策略生效的任务结果类型；省略时对所有结果类型生效。
  outcome?: "answer" | "resume_change" | "draft";
  // 允许任务完成所必需的成功证据。
  requiredEvidence: ResumeAgentEvidenceKind[];
  // 指定成功证据之后还必须再次取得读取证据。
  readAfterEvidence?: ResumeAgentEvidenceKind[];
  // 任务完成前还必须由成功工具结果证明的业务事实。
  requiredFacts?: string[];
  // 任务完成前必须满足的成功证据先后关系。
  evidenceOrder?: ResumeAgentEvidenceOrder[];
};
