import type {
  ResumeAgentCompletionPolicy,
  ResumeAgentEvidenceKind,
  ResumeAgentEvidenceOrder,
  ResumeAgentRequiredEffect,
  ResumeAgentToolRuntimeMeta,
} from "./types";
import type { ResumeAgentTaskEvidence } from "./taskTypes";
import {
  collectLatestSuccessfulFacts,
  findLatestActualChangeEvidence,
  findLatestSuccessfulActualEvidence,
  findLatestSuccessfulEvidence,
} from "./taskEvidence";

export type ResolvedResumeAgentCompletionPolicy = {
  // 当前任务最终要求产生的业务效果。
  requiredEffects: ResumeAgentRequiredEffect[];
  // 任务完成所需的成功工具证据。
  requiredEvidence: ResumeAgentEvidenceKind[];
  // 指定业务效果之后必须重新取得的读取证据。
  readAfterEvidence: ResumeAgentEvidenceKind[];
  // 完成前必须由工具证明的业务事实。
  requiredFacts: string[];
  // 完成前必须满足的工具证据顺序。
  evidenceOrder: ResumeAgentEvidenceOrder[];
};

export type ResumeAgentCompletionResult = {
  // 当前证据是否已经满足完整任务契约。
  completed: boolean;
  // 尚未完成时提供给 ReAct 的下一步说明，完成时为 null。
  retryMessage: string | null;
};

const EVIDENCE_NAMES: Record<ResumeAgentEvidenceKind, string> = {
  read: "资料读取", // 资料读取证据的用户可读名称。
  resume_change: "简历写入", // 简历写入证据的用户可读名称。
  draft_submit: "草稿提交", // 草稿提交证据的用户可读名称。
  language_update: "展示语言同步", // 展示语言同步证据的用户可读名称。
};

// 合并模型规划、按钮任务和任务能力的完成要求，生成唯一验收策略。
// 策略只描述本轮必须产生的业务后果；执行前置与顺序由工具元数据声明，这里翻译而非重写。
export const resolveResumeAgentCompletionPolicy = (
  plannedEffects: ResumeAgentRequiredEffect[],
  policies: ResumeAgentCompletionPolicy[],
  tools: ResumeAgentToolRuntimeMeta[] = [],
): ResolvedResumeAgentCompletionPolicy => {
  const requiredEffects = new Set(plannedEffects);
  const activePolicies = policies.filter(
    (policy) => !policy.whenEffect || requiredEffects.has(policy.whenEffect),
  );
  activePolicies.forEach((policy) => {
    policy.requiredEffects?.forEach((effect) => requiredEffects.add(effect));
  });

  // 执行前置约束只有一处真相源：工具元数据。验收层只把它翻译成本轮的验收要求，
  // 不再按效果硬编码一遍，避免新增工具时两处口径漂移。
  const requiredEvidence = new Set<ResumeAgentEvidenceKind>(requiredEffects);
  const readAfterEvidence = new Set<ResumeAgentEvidenceKind>();
  const requiredFacts = new Set<string>();
  const evidenceOrder: ResumeAgentEvidenceOrder[] = [];
  // 只为本轮真正要求产生效果的工具有效，纯读取工具不参与验收。
  tools.forEach((meta) => {
    if (meta.evidenceKind === "read" || !requiredEffects.has(meta.evidenceKind)) return;
    (meta.requiresEvidence ?? []).forEach((kind) => {
      requiredEvidence.add(kind);
      if (!evidenceOrder.some((item) => item.evidence === meta.evidenceKind && item.after === kind)) {
        evidenceOrder.push({ evidence: meta.evidenceKind, after: kind });
      }
    });
  });
  activePolicies.forEach((policy) => {
    policy.requiredEvidence?.forEach((kind) => requiredEvidence.add(kind));
    policy.readAfterEvidence?.forEach((kind) => readAfterEvidence.add(kind));
    policy.requiredFacts?.forEach((fact) => requiredFacts.add(fact));
    policy.evidenceOrder?.forEach((order) => {
      if (!evidenceOrder.some((item) => item.evidence === order.evidence && item.after === order.after)) {
        evidenceOrder.push(order);
      }
    });
  });
  return {
    requiredEffects: [...requiredEffects],
    requiredEvidence: [...requiredEvidence],
    readAfterEvidence: [...readAfterEvidence],
    requiredFacts: [...requiredFacts],
    evidenceOrder,
  };
};

// 只依据工具证据判断任务是否完成，不采信模型在正文中的完成声明。
export const evaluateResumeAgentCompletion = (
  evidence: ResumeAgentTaskEvidence[],
  policy: ResolvedResumeAgentCompletionPolicy,
  allowTaskPause: boolean,
): ResumeAgentCompletionResult => {
  const missingEvidence = policy.requiredEvidence.filter(
    // 业务效果既要最近一次尝试成功，也要本轮真实执行过，跳过写入不能单独充数。
    (kind) => !findLatestSuccessfulEvidence(evidence, kind) ||
      !findLatestSuccessfulActualEvidence(evidence, kind),
  );
  const successfulFacts = collectLatestSuccessfulFacts(evidence);
  const missingFacts = policy.requiredFacts.filter((fact) => !successfulFacts.has(fact));
  const invalidEvidenceOrder = policy.evidenceOrder.find((order) => {
    // 写后重新读取不应推翻写入前已有的读取证据。
    const laterEvidence = findLatestSuccessfulActualEvidence(evidence, order.evidence);
    return laterEvidence && !evidence.some((item) =>
      item.kind === order.after && item.status === "success" && item.sequence < laterEvidence.sequence
    );
  });

  if (!missingEvidence.length && !missingFacts.length && !invalidEvidenceOrder) {
    const staleReadAfter = policy.readAfterEvidence.find((kind) => {
      const operationEvidence = findLatestActualChangeEvidence(evidence, kind);
      const readEvidence = findLatestSuccessfulEvidence(evidence, "read");
      return operationEvidence && (!readEvidence || readEvidence.sequence <= operationEvidence.sequence);
    });
    if (!staleReadAfter) return { completed: true, retryMessage: null };
    return {
      completed: false,
      retryMessage: `已完成${EVIDENCE_NAMES[staleReadAfter]}，请重新读取最新简历数据后再生成最终结果。`,
    };
  }
  if (invalidEvidenceOrder) {
    return {
      completed: false,
      retryMessage: `请在${EVIDENCE_NAMES[invalidEvidenceOrder.after]}成功后重新完成${EVIDENCE_NAMES[invalidEvidenceOrder.evidence]}。`,
    };
  }
  if (missingEvidence.length) {
    const missingNames = missingEvidence.map((kind) => EVIDENCE_NAMES[kind]).join("、");
    return {
      completed: false,
      retryMessage: allowTaskPause
        ? `本轮任务还缺少${missingNames}的成功证据。请继续使用可用工具完成任务；确实缺少必要事实时调用 request_resume_input，确认无法安全执行时调用 report_resume_blocker。`
        : `本轮任务还缺少${missingNames}的成功证据。请继续使用已有资料和可用工具完成任务；未知细节使用 XX 占位，不得冒充已确认事实。`,
    };
  }
  if (missingFacts.length) {
    return {
      completed: false,
      retryMessage: allowTaskPause
        ? "本轮任务尚未取得完整处理结果，请继续根据工具返回的未完成项执行；确实无法继续时再记录缺失信息或阻塞原因。"
        : "本轮任务尚未取得完整处理结果，请继续根据工具返回的未完成项执行。",
    };
  }
  return { completed: false, retryMessage: "本轮任务尚未满足完成条件，请继续核对工具结果。" };
};
