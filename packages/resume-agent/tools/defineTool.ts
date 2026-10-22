import type {
  ResumeAgentEvidenceKind,
  ResumeAgentTool,
  ResumeAgentToolEffect,
  ResumeAgentToolEvaluation,
  ResumeAgentToolReplayScope,
} from "../runtime/types";

// 工具效果与证据类型的固定对应关系，避免每个工具重复声明
const EFFECT_EVIDENCE: Record<ResumeAgentToolEffect, ResumeAgentEvidenceKind> = {
  read: "read",
  mutation: "resume_change",
  submit: "draft_submit",
  sync: "language_update",
};

export type ResumeToolDefinition = {
  // 工具名称，模型据此调用。
  name: string;
  // 工具用途说明。
  description: string;
  // 工具参数结构。
  parameters: Record<string, unknown>;
  // 工具执行逻辑。
  execute: (args: any) => unknown;
  // 工具对任务产生的效果类型。
  effect: ResumeAgentToolEffect;
  // 证据类型，省略时按效果推导。
  evidenceKind?: ResumeAgentEvidenceKind;
  // 是否让已有读取失效，省略时写入类工具默认失效。
  invalidatesRead?: boolean;
  // 相同参数重复调用时的复用范围，省略时每次都重新执行。
  replayScope?: ResumeAgentToolReplayScope;
  // 调用前必须已经取得的成功证据。
  requiresEvidence?: ResumeAgentEvidenceKind[];
  // 依据业务结果判断成功、部分成功或失败。
  evaluate: (result: unknown) => ResumeAgentToolEvaluation;
};

// 定义业务工具：只声明差异项，运行时元数据的默认值由本函数统一补齐
export const defineTool = (definition: ResumeToolDefinition): ResumeAgentTool => ({
  name: definition.name,
  description: definition.description,
  parameters: definition.parameters,
  execute: definition.execute,
  taskMeta: {
    effect: definition.effect,
    evidenceKind: definition.evidenceKind ?? EFFECT_EVIDENCE[definition.effect],
    // 写入类工具默认让之前的读取结果失效，漏写会导致后续判断基于过期数据
    invalidatesRead: definition.invalidatesRead ?? definition.effect === "mutation",
    replayScope: definition.replayScope ?? "none",
    requiresEvidence: definition.requiresEvidence,
    evaluate: definition.evaluate,
  },
});
