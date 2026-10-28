import type {
  ResumeAgentCompletionPolicy,
  ResumeAgentEvidenceKind,
  ResumeAgentEvidenceOrder,
  ResumeAgentRequiredEffect,
  ResumeAgentToolRuntimeMeta,
} from "./types";
import type { ResumeAgentIncompleteReason, ResumeAgentTaskEvidence } from "./taskTypes";
import { findResumeModuleSchema } from "../schema/resumeSchemaRegistry";
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
  // 读取范围覆盖要求；为空表示只校验发生过对应操作。
  scopeCoverage: "read_scope" | null;
};

export type ResumeAgentCompletionResult = {
  // 当前证据是否已经满足完整任务契约。
  completed: boolean;
  // 未完成时的原因，完成时为 null。
  reason: ResumeAgentIncompleteReason | null;
};

const EVIDENCE_NAMES: Record<ResumeAgentEvidenceKind, string> = {
  read: "资料读取", // 资料读取证据的用户可读名称。
  resume_change: "简历写入", // 简历写入证据的用户可读名称。
  draft_submit: "草稿提交", // 草稿提交证据的用户可读名称。
  language_update: "展示语言同步", // 展示语言同步证据的用户可读名称。
};

// 证据中的模块事实统一使用该前缀，读取与写入两侧按同一口径产出。
const MODULE_FACT_PREFIX = "module:";

// 汇总符合条件的证据涉及的模块 key
const collectModuleKeys = (
  evidence: ResumeAgentTaskEvidence[],
  accept: (item: ResumeAgentTaskEvidence) => boolean,
) => {
  const keys = new Set<string>();
  evidence.filter(accept).forEach((item) => {
    (item.facts ?? []).forEach((fact) => {
      if (fact.startsWith(MODULE_FACT_PREFIX)) keys.add(fact.slice(MODULE_FACT_PREFIX.length));
    });
  });
  return keys;
};

// 读取范围覆盖校验：声明 read_scope 时，本轮读取涉及的模块必须全部出现在真实改动里。
// 只证明"发生过一次写入"不足以说明用户要求的整份范围已经处理。
const findUncoveredReadModules = (
  evidence: ResumeAgentTaskEvidence[],
  coverage: "read_scope" | null,
) => {
  if (coverage !== "read_scope") return [];
  const readModules = collectModuleKeys(
    evidence,
    (item) => item.kind === "read" && item.status === "success",
  );
  const changedModules = collectModuleKeys(
    evidence,
    (item) => item.kind === "resume_change" && !item.replayed &&
      item.changed === true && item.status !== "failed",
  );
  return [...readModules].filter((key) => !changedModules.has(key));
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
  let scopeCoverage: "read_scope" | null = null;
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
    // 覆盖要求取最严格的一档：任一能力声明即生效
    if (policy.scopeCoverage) scopeCoverage = policy.scopeCoverage;
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
    scopeCoverage,
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
    // 读取范围未全部处理时仍算未完成，避免一次局部写入被当成整份完成
    const uncoveredModules = findUncoveredReadModules(evidence, policy.scopeCoverage);
    if (uncoveredModules.length) {
      // 模块标识统一转成展示名，避免向用户输出内部 key
      const names = uncoveredModules.map((key) => findResumeModuleSchema(key)?.title ?? key).join("、");
      return {
        completed: false,
        reason: {
          code: "scope_uncovered",
          detail: names,
          text: `本轮读取的${names}还没有实际改动，请继续完成这些范围后再给出结果。`,
        },
      };
    }
    const staleReadAfter = policy.readAfterEvidence.find((kind) => {
      const operationEvidence = findLatestActualChangeEvidence(evidence, kind);
      const readEvidence = findLatestSuccessfulEvidence(evidence, "read");
      return operationEvidence && (!readEvidence || readEvidence.sequence <= operationEvidence.sequence);
    });
    if (!staleReadAfter) return { completed: true, reason: null };
    return {
      completed: false,
      reason: {
        code: "stale_read",
        detail: EVIDENCE_NAMES[staleReadAfter],
        text: `已完成${EVIDENCE_NAMES[staleReadAfter]}，请重新读取最新简历数据后再生成最终结果。`,
      },
    };
  }
  if (invalidEvidenceOrder) {
    return {
      completed: false,
      reason: {
        code: "evidence_order",
        detail: `${EVIDENCE_NAMES[invalidEvidenceOrder.after]}→${EVIDENCE_NAMES[invalidEvidenceOrder.evidence]}`,
        text: `请在${EVIDENCE_NAMES[invalidEvidenceOrder.after]}成功后重新完成${EVIDENCE_NAMES[invalidEvidenceOrder.evidence]}。`,
      },
    };
  }
  if (missingEvidence.length) {
    const missingNames = missingEvidence.map((kind) => EVIDENCE_NAMES[kind]).join("、");
    return {
      completed: false,
      reason: {
        code: "missing_evidence",
        detail: missingNames,
        text: allowTaskPause
          ? `本轮任务还缺少${missingNames}的成功证据。请按当前入口和内容处理规则继续使用工具完成任务；确需补充时调用 request_resume_input，无法安全执行时调用 report_resume_blocker。`
          : `本轮任务还缺少${missingNames}的成功证据。请继续使用已有资料和可用工具完成任务；未知细节使用 XX 占位，不得冒充已确认事实。`,
      },
    };
  }
  if (missingFacts.length) {
    return {
      completed: false,
      reason: {
        code: "missing_facts",
        text: allowTaskPause
          ? "本轮任务尚未取得完整处理结果，请继续根据工具返回的未完成项执行；确实无法继续时再记录缺失信息或阻塞原因。"
          : "本轮任务尚未取得完整处理结果，请继续根据工具返回的未完成项执行。",
      },
    };
  }
  return {
    completed: false,
    reason: { code: "unresolved", text: "本轮任务尚未满足完成条件，请继续核对工具结果。" },
  };
};
