import type { ResumeAgentEvidenceKind } from "./types";
import type { ResumeAgentTaskEvidence } from "./taskTypes";

// 返回指定类型最后一次工具证据，失败结果也会覆盖更早结果。
export const findLatestEvidence = (
  evidence: ResumeAgentTaskEvidence[],
  kind: ResumeAgentEvidenceKind,
) => {
  for (let index = evidence.length - 1; index >= 0; index -= 1) {
    const item = evidence[index];
    if (item?.kind === kind) return item;
  }
  return undefined;
};

// 只有指定类型最后一次执行成功时才返回，避免复用已被后续失败覆盖的结果。
export const findLatestSuccessfulEvidence = (
  evidence: ResumeAgentTaskEvidence[],
  kind: ResumeAgentEvidenceKind,
) => {
  const item = findLatestEvidence(evidence, kind);
  return item?.status === "success" ? item : undefined;
};

// 返回指定类型最后一次产生实际变化的证据，跳过运行时复用结果。
export const findLatestActualChangeEvidence = (
  evidence: ResumeAgentTaskEvidence[],
  kind: ResumeAgentEvidenceKind,
) => {
  for (let index = evidence.length - 1; index >= 0; index -= 1) {
    const item = evidence[index];
    if (item?.kind === kind && !item.replayed && item.status !== "failed") return item;
  }
  return undefined;
};

// 每类证据只采用最后一次真实执行结果，汇总其中完整成功证明的业务事实。
export const collectLatestSuccessfulFacts = (evidence: ResumeAgentTaskEvidence[]) => {
  const latestEvidenceByKind = new Map<ResumeAgentEvidenceKind, ResumeAgentTaskEvidence>();
  evidence
    .filter((item) => !item.replayed)
    .forEach((item) => latestEvidenceByKind.set(item.kind, item));
  return new Set(
    [...latestEvidenceByKind.values()]
      .filter((item) => item.status === "success")
      .flatMap((item) => item.facts ?? []),
  );
};
