import type { ReactTool } from "@snowflake/ai";
import type {
  ResumeAgentTool,
  ResumeAgentToolResultStatus,
} from "./types";
import { findLatestSuccessfulActualEvidence, findLatestSuccessfulEvidence } from "./taskEvidence";
import type { ResumeAgentTaskState } from "./taskTypes";

type ResumeAgentToolAttempt = {
  // 相同参数的工具执行状态。
  status: ResumeAgentToolResultStatus;
  // 首次执行是否真实改变了业务数据。
  changed?: boolean;
  // 第一次真实执行返回的结果。
  result: unknown;
  // 执行时的简历数据版本，用于区分状态变化后的再次尝试。
  stateVersion: number;
  // 首次真实执行对应的证据顺序。
  sequence: number;
};

export type ResumeAgentToolExecution = {
  // 当前任务是否已经取得数据变更后仍有效的成功读取证据。
  hasFreshRead: () => boolean;
  // 包装业务工具，统一记录证据并处理相同调用的幂等语义。
  wrapTools: (tools: ReactTool[]) => ReactTool[];
};

// 每次任务创建独立的工具执行账本，集中维护证据顺序、数据版本和重复调用。
export const createResumeAgentToolExecution = (
  getTask: () => ResumeAgentTaskState | undefined,
  onEvidence?: (evidence: ResumeAgentTaskState["evidence"][number]) => void,
): ResumeAgentToolExecution => {
  const toolAttempts = new Map<string, ResumeAgentToolAttempt>();
  let toolSequence = 0;
  let lastReadInvalidationSequence = 0;
  let stateVersion = 0;

  const recordToolResult = (
    tool: ResumeAgentTool,
    result: unknown,
    sequence: number,
    replayed = false,
  ) => {
    const task = getTask();
    if (!task || !tool.taskMeta) return;
    const evaluation = tool.taskMeta.evaluate(result);
    const evidence = {
      sequence,
      tool: tool.name,
      kind: tool.taskMeta.evidenceKind,
      status: evaluation.status,
      summary: evaluation.summary,
      changed: evaluation.changed,
      facts: evaluation.facts,
      verifiedChanges: evaluation.verifiedChanges,
      replayed,
    };
    task.evidence.push(evidence);
    // 宿主只消费结构化执行事实，不再解析面向模型的观察文本。
    onEvidence?.(evidence);
    if (!replayed && tool.taskMeta.invalidatesRead && evaluation.status !== "failed" && evaluation.changed !== false) {
      // 数据已经变化或部分变化时，后续判断必须基于重新读取的最新数据。
      lastReadInvalidationSequence = sequence;
      stateVersion += 1;
    }
    if (tool.taskMeta.effect === "read" && evaluation.status === "success") {
      task.phase = "reading";
      return evaluation;
    }
    task.phase = evaluation.status === "failed" ? "acting" : "verifying";
    return evaluation;
  };

  const hasFreshRead = () => {
    const readEvidence = findLatestSuccessfulEvidence(getTask()?.evidence ?? [], "read");
    return Boolean(readEvidence && readEvidence.sequence > lastReadInvalidationSequence);
  };

  const wrapTools = (tools: ReactTool[]): ReactTool[] =>
    tools.map((sourceTool) => {
      const tool = sourceTool as ResumeAgentTool;
      return {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        // 业务工具返回后立即记录事实证据，任务阶段不依赖模型自述。
        execute: async (args) => {
          const task = getTask();
          const missingRequiredEvidence = tool.taskMeta?.requiresEvidence?.filter(
            // 写入类前置条件必须有真实效果，同值提交不能解锁后续工具。
            (kind) => (kind === "read" && !hasFreshRead()) ||
              !findLatestSuccessfulEvidence(task?.evidence ?? [], kind) ||
              (kind !== "read" && !findLatestSuccessfulActualEvidence(task?.evidence ?? [], kind)),
          ) ?? [];
          if (missingRequiredEvidence.length) {
            // 工具前置条件由执行内核依据真实证据检查，业务适配器无需维护请求级布尔状态。
            return {
              accepted: false, // 本次工具没有执行。
              missingRequiredEvidence, // 返回尚未取得的证据类型。
              error: "当前任务尚未完成本工具要求的前置操作", // 提供给模型的修正方向。
            };
          }
          const isStateChanging = tool.taskMeta && tool.taskMeta.effect !== "read";
          const replayScope = tool.taskMeta?.replayScope ?? "none";
          const attemptKey = replayScope === "none" ? "" : `${tool.name}:${JSON.stringify(args)}`;
          const previousAttempt = attemptKey ? toolAttempts.get(attemptKey) : undefined;
          const canReuseFailure = previousAttempt?.status === "failed" &&
            previousAttempt.stateVersion === stateVersion;
          // 只有完整成功才复用结果：部分成功必须真实重跑，否则失败项永远补不上
          const canReuseResult = previousAttempt?.status === "success" && (
            (replayScope === "task" && previousAttempt.changed !== false) ||
            previousAttempt.stateVersion === stateVersion
          );
          if (canReuseFailure) {
            // 数据未变化时相同失败参数不会再次执行，模型需要根据上次结果修正参数。
            return {
              accepted: false, // 本次没有再次执行工具。
              duplicateFailure: true, // 拒绝原因是相同失败参数被重复提交。
              error: "相同参数的工具调用已经失败，请根据上次结果修改参数后再试", // 提供给模型的修正方向。
            };
          }
          if (canReuseResult && previousAttempt) {
            // 完整或部分成功的相同操作直接复用首次结果，避免重复写入。
            recordToolResult(tool, previousAttempt.result, previousAttempt.sequence, true);
            return previousAttempt.result;
          }
          if (task && isStateChanging) {
            task.phase = "acting";
            task.pendingInput = undefined;
            task.blocker = undefined;
          }
          const result = await tool.execute(args);
          if (tool.taskMeta) {
            const sequence = ++toolSequence;
            const evaluation = recordToolResult(tool, result, sequence);
            if (attemptKey && evaluation) {
              toolAttempts.set(attemptKey, {
                status: evaluation.status,
                changed: evaluation.changed,
                result,
                stateVersion,
                sequence,
              });
            }
          }
          return result;
        },
      };
    });

  return { hasFreshRead, wrapTools };
};
