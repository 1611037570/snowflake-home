import type { ReactTool } from "@/apis/llm/react";
import type { Skill } from "../types";
import type {
  ResumeAgentCompletionPolicy,
  ResumeAgentEvidenceKind,
  ResumeAgentEvidenceOrder,
  ResumeAgentRequiredEffect,
  ResumeAgentTool,
  ResumeAgentToolResultStatus,
} from "./types";

export type ResumeAgentTaskRelation =
  // 用户提出可独立完成或需要不同业务效果的新任务。
  | "new"
  // 用户继续完成上一轮目标并继承其业务效果。
  | "continue"
  // 用户要求修正上一轮结果并继承其业务效果。
  | "revise";

export type ResumeAgentTaskPhase =
  // Agent 已经建立本轮任务计划。
  | "planned"
  // Agent 正在读取完成任务所需的资料。
  | "reading"
  // Agent 正在执行写入或提交动作。
  | "acting"
  // Agent 正在依据工具结果核对任务是否完成。
  | "verifying"
  // 当前确实缺少必要事实，等待用户补充。
  | "waiting"
  // 当前条件下无法继续安全执行。
  | "blocked"
  // 运行时已经确认任务完成。
  | "completed";

export type ResumeAgentTaskEvidence = {
  // 本条结果对应的首次真实工具执行顺序。
  sequence: number;
  // 产生证据的工具名称。
  tool: string;
  // 证据类型，用于区分读取、简历变更、草稿提交与语言同步。
  kind: ResumeAgentEvidenceKind;
  // 工具本次执行是完整成功、部分成功还是失败。
  status: ResumeAgentToolResultStatus;
  // 工具结果的简短事实摘要。
  summary: string;
  // 工具结果额外证明的业务事实。
  facts?: string[];
  // 是否复用了同一参数首次执行的结果。
  replayed?: boolean;
};

type ResumeAgentToolAttempt = {
  // 相同参数的工具执行状态。
  status: ResumeAgentToolResultStatus;
  // 第一次真实执行返回的结果。
  result: unknown;
  // 执行时的简历数据版本，用于区分状态变化后的再次尝试。
  stateVersion: number;
  // 首次真实执行对应的证据顺序。
  sequence: number;
};

export type ResumeAgentPendingInput = {
  // 继续任务所缺少的具体事实。
  missingFacts: string[];
  // 向用户提出的单个明确问题。
  question: string;
  // 缺少这些事实会影响任务的原因。
  reason: string;
};

export type ResumeAgentTaskBlocker = {
  // 阻止当前任务继续执行的具体原因。
  reason: string;
  // 用户可采取的解决方式。
  suggestion?: string;
};

export type ResumeAgentTaskState = {
  // 本次任务的稳定标识。
  id: string;
  // 任务来源，例如普通聊天或具体功能入口。
  source: string;
  // 本轮任务与上一轮任务的关系。
  relation: ResumeAgentTaskRelation;
  // 用户最终希望达成的目标。
  objective: string;
  // 当前目标模块、记录或内容范围。
  scope: string;
  // 用户要求任务真实产生的业务效果；空数组表示文字回复即可完成。
  requiredEffects: ResumeAgentRequiredEffect[];
  // 用户可核对的任务完成条件。
  successCondition: string;
  // 本轮选中的通用能力标识。
  capabilityIds: string[];
  // 由运行时维护的当前执行阶段。
  phase: ResumeAgentTaskPhase;
  // 等待用户补充时保存的缺失事实和问题。
  pendingInput?: ResumeAgentPendingInput;
  // 当前任务无法继续时保存的阻塞信息。
  blocker?: ResumeAgentTaskBlocker;
  // 本轮工具执行产生的成功、部分成功与失败证据。
  evidence: ResumeAgentTaskEvidence[];
};

export type ResumeAgentTaskProfile = {
  // 按钮任务的稳定标识。
  id: string;
  // 按钮已经明确的任务目标。
  objective: string;
  // 按钮任务固定要求产生的业务效果。
  requiredEffects: ResumeAgentRequiredEffect[];
  // 按钮任务固定的用户可核对完成条件。
  successCondition: string;
  // 仅在该按钮任务中注入的执行要求。
  instructions: string;
  // 由运行时核对的按钮任务完成条件。
  completionPolicy: ResumeAgentCompletionPolicy;
};

export type CreateResumeAgentTaskRuntimeOptions = {
  // 本次请求使用的任务标识。
  taskId: string;
  // 任务入口来源。
  source: string;
  // 上一轮未结束或可承接的任务状态。
  previousTask?: ResumeAgentTaskState;
  // 当前允许作为任务能力的技能。
  capabilities?: Skill[];
  // 功能入口已经明确指定的主要能力。
  preferredCapabilityId?: string;
  // 功能入口已经明确指定的必需业务效果。
  fixedRequiredEffects?: ResumeAgentRequiredEffect[];
  // 功能入口已经明确指定的完成条件。
  fixedSuccessCondition?: string;
  // 当前入口是否允许以等待补充或阻塞状态暂停任务。
  allowTaskPause?: boolean;
  // 按钮入口直接指定的任务配置，不参与通用技能选择。
  taskProfile?: ResumeAgentTaskProfile;
};

const TASK_RELATIONS: ResumeAgentTaskRelation[] = ["new", "continue", "revise"];
const TASK_REQUIRED_EFFECTS: ResumeAgentRequiredEffect[] = [
  "resume_change",
  "draft_submit",
  "language_update",
];

const cloneTask = (task?: ResumeAgentTaskState): ResumeAgentTaskState | undefined =>
  task ? JSON.parse(JSON.stringify(task)) : undefined;

const EVIDENCE_NAMES: Record<ResumeAgentEvidenceKind, string> = {
  read: "资料读取", // 资料读取证据的用户可读名称。
  resume_change: "简历写入", // 简历写入证据的用户可读名称。
  draft_submit: "草稿提交", // 草稿提交证据的用户可读名称。
  language_update: "展示语言同步", // 展示语言同步证据的用户可读名称。
};

type ResolvedResumeAgentCompletionPolicy = {
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

// 同一个 Agent 只负责规划与行动，任务阶段和完成结果由运行时依据工具事实维护。
export const createResumeAgentTaskRuntime = (options: CreateResumeAgentTaskRuntimeOptions) => {
  let task: ResumeAgentTaskState | undefined;
  const previousTask = cloneTask(options.previousTask);
  const capabilityMap = new Map((options.capabilities ?? []).map((skill) => [skill.id, skill]));
  const capabilityIds = [...capabilityMap.keys()];
  const capabilityCatalog = [...capabilityMap.values()]
    .map((skill) => `${skill.id}：${skill.name}，${skill.description}`)
    .join("\n");
  const capabilityDescription = capabilityCatalog
    ? `完成本轮任务最相关的任务能力标识；没有合适能力时传空数组。可选能力：\n${capabilityCatalog}`
    : "当前入口没有可选任务能力，传空数组。";
  const toolAttempts = new Map<string, ResumeAgentToolAttempt>();
  let toolSequence = 0;
  let lastReadInvalidationSequence = 0;
  let stateVersion = 0;
  let completionPolicy: ResolvedResumeAgentCompletionPolicy = {
    requiredEffects: [], // 建立任务后写入最终任务效果。
    requiredEvidence: [], // 建立任务后再按必需效果和能力填充。
    readAfterEvidence: [], // 建立任务后再合并写后读取要求。
    requiredFacts: [], // 建立任务后再合并业务事实要求。
    evidenceOrder: [], // 建立任务后再合并工具执行顺序。
  };

  const resolveCompletionPolicy = (
    plannedEffects: ResumeAgentRequiredEffect[],
    selectedCapabilityIds: string[],
  ): ResolvedResumeAgentCompletionPolicy => {
    const requiredEffects = new Set(plannedEffects);
    const readAfterEvidence = new Set<ResumeAgentEvidenceKind>();
    const requiredFacts = new Set<string>();
    const evidenceOrder: ResumeAgentEvidenceOrder[] = [];
    const policies = [
      options.taskProfile?.completionPolicy,
      ...selectedCapabilityIds.map((id) => capabilityMap.get(id)?.completionPolicy),
    ].filter((policy): policy is ResumeAgentCompletionPolicy =>
      Boolean(policy && (!policy.whenEffect || requiredEffects.has(policy.whenEffect))),
    );
    policies.forEach((policy) => {
      policy.requiredEffects?.forEach((effect) => requiredEffects.add(effect));
    });
    const requiredEvidence = new Set<ResumeAgentEvidenceKind>(requiredEffects);
    ["resume_change", "draft_submit"].forEach((effect) => {
      if (!requiredEffects.has(effect as ResumeAgentRequiredEffect)) return;
      // 写入当前简历或提交草稿前必须先取得本轮授权范围内的真实资料。
      requiredEvidence.add("read");
      evidenceOrder.push({ evidence: effect as ResumeAgentRequiredEffect, after: "read" });
    });
    policies.forEach((policy) => {
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
      requiredEffects: [...requiredEffects], // 规划效果与能力补充效果合并后的最终契约。
      requiredEvidence: [...requiredEvidence], // 默认要求与能力要求合并后的完成证据。
      readAfterEvidence: [...readAfterEvidence], // 必须在操作后重新读取的证据类型。
      requiredFacts: [...requiredFacts], // 特定能力要求工具证明的业务事实。
      evidenceOrder, // 特定能力要求的工具成功顺序。
    };
  };

  const getLatestEvidence = (kind: ResumeAgentEvidenceKind) => {
    const evidence = task?.evidence ?? [];
    for (let index = evidence.length - 1; index >= 0; index -= 1) {
      const item = evidence[index];
      if (item?.kind === kind) return item;
    }
    return undefined;
  };

  const getLatestSuccessfulEvidence = (kind: ResumeAgentEvidenceKind) => {
    const evidence = getLatestEvidence(kind);
    return evidence?.status === "success" ? evidence : undefined;
  };

  const getLatestActualChangeEvidence = (kind: ResumeAgentEvidenceKind) => {
    const evidence = task?.evidence ?? [];
    for (let index = evidence.length - 1; index >= 0; index -= 1) {
      const item = evidence[index];
      if (item?.kind === kind && !item.replayed && item.status !== "failed") return item;
    }
    return undefined;
  };

  const hasFreshRead = () => {
    const readEvidence = getLatestSuccessfulEvidence("read");
    return Boolean(readEvidence && readEvidence.sequence > lastReadInvalidationSequence);
  };

  const planTaskTool: ReactTool = {
    name: "plan_resume_task",
    description:
      "根据用户原始消息、功能入口、近期对话和上一轮任务建立本轮任务契约。判断文字回复是否足以完成请求；若用户需要当前简历、草稿或展示语言真实变化，必须声明对应 requiredEffects。选择 capabilityIds 后会返回对应能力全文。",
    parameters: {
      type: "object",
      properties: {
        relation: {
          type: "string",
          enum: TASK_RELATIONS,
          description: "new 表示可独立完成或需要不同业务效果的请求；continue 表示继续上一任务并继承其业务效果；revise 表示修正上一结果并继承其业务效果。",
        },
        objective: {
          type: "string",
          description: "用户最终希望达成的目标，结合近期对话理解省略表达。",
        },
        scope: {
          type: "string",
          description: "本轮涉及的模块、记录或内容范围；无法确定时如实说明。",
        },
        requiredEffects: {
          type: "array",
          items: {
            type: "string",
            enum: TASK_REQUIRED_EFFECTS,
          },
          uniqueItems: true,
          description: "new 任务必须真实发生的业务效果；只需解释、分析或建议时传空数组。resume_change 表示当前简历必须写入，draft_submit 表示必须提交结构化草稿，language_update 表示必须同步展示语言。continue 或 revise 会继承上一任务效果。",
        },
        successCondition: {
          type: "string",
          description: "一句可核对的完成条件，说明用户最终应得到什么结果，不能只写已回答或已处理。",
        },
        capabilityIds: {
          type: "array",
          items: {
            type: "string",
            ...(capabilityIds.length ? { enum: capabilityIds } : {}),
          },
          maxItems: 3,
          uniqueItems: true,
          description: capabilityDescription,
        },
      },
      required: ["relation", "objective", "scope", "requiredEffects", "successCondition", "capabilityIds"],
      additionalProperties: false,
    },
    execute: (args) => {
      if (task) {
        // 同一 ReAct 只建立一次任务，避免执行中重新规划后丢失已取得的证据。
        return { accepted: false, error: "本轮任务已经建立，请继续执行当前任务" };
      }
      if (
        !TASK_RELATIONS.includes(args?.relation) ||
        typeof args?.objective !== "string" || !args.objective.trim() ||
        typeof args?.scope !== "string" || !args.scope.trim() ||
        !Array.isArray(args?.requiredEffects) ||
        args.requiredEffects.some((effect: unknown) => !TASK_REQUIRED_EFFECTS.includes(effect as ResumeAgentRequiredEffect)) ||
        typeof args?.successCondition !== "string" || !args.successCondition.trim() ||
        !Array.isArray(args?.capabilityIds)
      ) {
        // 参数不完整时把原因留给 ReAct 自行修正，避免任务规划工具中断请求。
        return { accepted: false, error: "任务契约参数不完整，请补全任务关系、目标、范围、必需效果、完成条件和能力后重试" };
      }
      // 明确功能入口和没有上一任务的对话都从新任务开始，避免误承接历史目标。
      const relation: ResumeAgentTaskRelation = options.source === "chat" && previousTask
        ? args.relation as ResumeAgentTaskRelation
        : "new";
      const requestedCapabilityIds = args.capabilityIds.filter(
        (id: unknown): id is string => typeof id === "string" && capabilityMap.has(id),
      );
      const continuedCapabilityIds = relation === "new" ? [] : previousTask?.capabilityIds ?? [];
      const selectedCapabilityIds = [
        ...(options.preferredCapabilityId ? [options.preferredCapabilityId] : []),
        ...requestedCapabilityIds,
        ...(requestedCapabilityIds.length ? [] : continuedCapabilityIds),
      ].filter((id, index, list) => capabilityMap.has(id) && list.indexOf(id) === index).slice(0, 3);
      const plannedEffects = options.taskProfile?.requiredEffects ??
        options.fixedRequiredEffects ??
        (relation !== "new" && previousTask
          ? previousTask.requiredEffects
          : args.requiredEffects as ResumeAgentRequiredEffect[]);
      const resolvedPolicy = resolveCompletionPolicy(plannedEffects ?? [], selectedCapabilityIds);
      task = {
        id: options.taskId,
        source: options.source,
        relation,
        objective: options.taskProfile?.objective ?? args.objective.trim(),
        scope: args.scope.trim(),
        requiredEffects: resolvedPolicy.requiredEffects,
        successCondition: options.taskProfile?.successCondition ??
          options.fixedSuccessCondition ??
          args.successCondition.trim(),
        capabilityIds: selectedCapabilityIds,
        phase: "planned",
        evidence: [],
      };
      // 完成条件由任务效果与本轮选中的能力共同决定，不依赖模型自行声明完成。
      completionPolicy = resolvedPolicy;
      return {
        accepted: true,
        task,
        capabilities: selectedCapabilityIds.map((id) => {
          const capability = capabilityMap.get(id)!;
          return { id: capability.id, name: capability.name, instructions: capability.instructions };
        }),
      };
    },
  };

  const requestInputTool: ReactTool = {
    name: "request_resume_input",
    description:
      "已有资料不足以可靠继续任务时，记录缺失事实并向用户提出一个明确问题。修改或草稿任务必须先读取当前可用资料。",
    parameters: {
      type: "object",
      properties: {
        missingFacts: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          uniqueItems: true,
          description: "继续任务确实缺少的事实列表。",
        },
        question: {
          type: "string",
          description: "准备向用户提出的单个明确问题。",
        },
        reason: {
          type: "string",
          description: "缺少这些事实会影响任务的原因。",
        },
      },
      required: ["missingFacts", "question", "reason"],
      additionalProperties: false,
    },
    execute: (args) => {
      if (!task) return { accepted: false, error: "请先调用 plan_resume_task 建立本轮任务" };
      if (options.allowTaskPause === false) {
        return { accepted: false, error: "当前入口不能暂停等待补充，请使用已有资料继续完成任务" };
      }
      if (
        !Array.isArray(args?.missingFacts) || !args.missingFacts.length ||
        args.missingFacts.some((item: unknown) => typeof item !== "string" || !item.trim()) ||
        typeof args?.question !== "string" || !args.question.trim() ||
        typeof args?.reason !== "string" || !args.reason.trim()
      ) {
        return { accepted: false, error: "缺失事实、问题和原因不能为空" };
      }
      if (task.requiredEffects.length && !hasFreshRead()) {
        return { accepted: false, error: "请先读取当前最新的简历或入口资料，再判断需要用户补充什么" };
      }
      task.phase = "waiting";
      task.pendingInput = {
        missingFacts: args.missingFacts.map((item: string) => item.trim()),
        question: args.question.trim(),
        reason: args.reason.trim(),
      };
      task.blocker = undefined;
      return { accepted: true, pendingInput: task.pendingInput };
    },
  };

  const reportBlockerTool: ReactTool = {
    name: "report_resume_blocker",
    description:
      "读取当前可用资料后，确认任务无法安全继续时记录阻塞原因。仅在继续执行会编造事实、破坏数据或没有可安全操作内容时使用。",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "当前任务无法继续执行的具体原因。",
        },
        suggestion: {
          type: "string",
          description: "用户可以采取的解决方式；没有明确解决方式时省略。",
        },
      },
      required: ["reason"],
      additionalProperties: false,
    },
    execute: (args) => {
      if (!task) return { accepted: false, error: "请先调用 plan_resume_task 建立本轮任务" };
      if (options.allowTaskPause === false) {
        return { accepted: false, error: "当前入口不能以阻塞状态结束，请使用已有资料继续完成任务" };
      }
      if (typeof args?.reason !== "string" || !args.reason.trim()) {
        return { accepted: false, error: "阻塞原因不能为空" };
      }
      if (task.requiredEffects.length && !hasFreshRead()) {
        return { accepted: false, error: "请先读取当前最新的简历或入口资料，再判断任务是否无法继续" };
      }
      task.phase = "blocked";
      task.blocker = {
        reason: args.reason.trim(),
        suggestion: typeof args.suggestion === "string" && args.suggestion.trim()
          ? args.suggestion.trim()
          : undefined,
      };
      task.pendingInput = undefined;
      return { accepted: true, blocker: task.blocker };
    },
  };

  const recordToolResult = (
    tool: ResumeAgentTool,
    result: unknown,
    sequence: number,
    replayed = false,
  ) => {
    if (!task || !tool.taskMeta) return;
    const evaluation = tool.taskMeta.evaluate(result);
    task.evidence.push({
      sequence,
      tool: tool.name,
      kind: tool.taskMeta.evidenceKind,
      status: evaluation.status,
      summary: evaluation.summary,
      facts: evaluation.facts,
      replayed,
    });
    if (!replayed && tool.taskMeta.invalidatesRead && evaluation.status !== "failed") {
      // 数据已经变化或部分变化时，后续判断必须基于重新读取的最新数据。
      lastReadInvalidationSequence = sequence;
      stateVersion += 1;
    }
    if (tool.taskMeta.effect === "read" && evaluation.status === "success") {
      task.phase = "reading";
      return evaluation.status;
    }
    task.phase = evaluation.status === "failed" ? "acting" : "verifying";
    return evaluation.status;
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
          const isStateChanging = tool.taskMeta && tool.taskMeta.effect !== "read";
          const replayScope = tool.taskMeta?.replayScope ?? "none";
          const attemptKey = replayScope === "none" ? "" : `${tool.name}:${JSON.stringify(args)}`;
          const previousAttempt = attemptKey ? toolAttempts.get(attemptKey) : undefined;
          const canReuseFailure = previousAttempt?.status === "failed" &&
            previousAttempt.stateVersion === stateVersion;
          const canReuseResult = previousAttempt && previousAttempt.status !== "failed" && (
            replayScope === "task" || previousAttempt.stateVersion === stateVersion
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
            const status = recordToolResult(tool, result, sequence);
            if (attemptKey && status) {
              toolAttempts.set(attemptKey, { status, result, stateVersion, sequence });
            }
          }
          return result;
        },
      };
    });

  const beforeFinal = () => {
    if (!task) return "尚未建立本轮任务，请先调用 plan_resume_task。";
    if (task.phase === "waiting" || task.phase === "blocked") return null;
    const missingEvidence = completionPolicy.requiredEvidence.filter(
      (kind) => !getLatestSuccessfulEvidence(kind),
    );
    const latestEvidenceByKind = new Map<ResumeAgentEvidenceKind, ResumeAgentTaskEvidence>();
    task.evidence
      .filter((item) => !item.replayed)
      .forEach((item) => latestEvidenceByKind.set(item.kind, item));
    const successfulFacts = new Set(
      [...latestEvidenceByKind.values()]
        .filter((item) => item.status === "success")
        .flatMap((item) => item.facts ?? []),
    );
    const missingFacts = (completionPolicy.requiredFacts ?? []).filter(
      (fact) => !successfulFacts.has(fact),
    );
    const invalidEvidenceOrder = (completionPolicy.evidenceOrder ?? []).find((order) => {
      const earlierEvidence = getLatestActualChangeEvidence(order.after);
      const laterEvidence = getLatestSuccessfulEvidence(order.evidence);
      return earlierEvidence && laterEvidence && laterEvidence.sequence <= earlierEvidence.sequence;
    });
    if (!missingEvidence.length && !missingFacts.length && !invalidEvidenceOrder) {
      const staleReadAfter = (completionPolicy.readAfterEvidence ?? []).find((kind) => {
        const operationEvidence = getLatestActualChangeEvidence(kind);
        const readEvidence = getLatestSuccessfulEvidence("read");
        return operationEvidence && (!readEvidence || readEvidence.sequence <= operationEvidence.sequence);
      });
      if (!staleReadAfter) {
        task.phase = "completed";
        task.pendingInput = undefined;
        task.blocker = undefined;
        return null;
      }
      task.phase = "verifying";
      return `已完成${EVIDENCE_NAMES[staleReadAfter]}，请重新读取最新简历数据后再生成最终结果。`;
    }
    task.phase = "verifying";
    if (invalidEvidenceOrder) {
      return `请在${EVIDENCE_NAMES[invalidEvidenceOrder.after]}成功后重新完成${EVIDENCE_NAMES[invalidEvidenceOrder.evidence]}。`;
    }
    if (missingEvidence.length) {
      const missingNames = missingEvidence.map((kind) => EVIDENCE_NAMES[kind]).join("、");
      return options.allowTaskPause === false
        ? `本轮任务还缺少${missingNames}的成功证据。请继续使用已有资料和可用工具完成任务，不要编造事实。`
        : `本轮任务还缺少${missingNames}的成功证据。请继续使用可用工具完成任务；确实缺少必要事实时调用 request_resume_input，确认无法安全执行时调用 report_resume_blocker。`;
    }
    if (missingFacts.length) {
      return options.allowTaskPause === false
        ? "本轮任务尚未取得完整处理结果，请继续根据工具返回的未完成项执行。"
        : "本轮任务尚未取得完整处理结果，请继续根据工具返回的未完成项执行；确实无法继续时再记录缺失信息或阻塞原因。";
    }
    return "本轮任务尚未满足完成条件，请继续核对工具结果。";
  };

  const buildContext = () => {
    const previousContext = previousTask
      ? {
          id: previousTask.id, // 上一任务标识。
          source: previousTask.source, // 上一任务入口。
          objective: previousTask.objective, // 上一任务目标。
          scope: previousTask.scope, // 上一任务作用范围。
          requiredEffects: previousTask.requiredEffects, // 上一任务要求真实产生的业务效果。
          successCondition: previousTask.successCondition, // 上一任务的用户可核对完成条件。
          capabilityIds: previousTask.capabilityIds, // 上一任务使用的能力。
          phase: previousTask.phase, // 上一任务结束阶段。
          pendingInput: previousTask.pendingInput, // 上一任务等待补充的信息。
          blocker: previousTask.blocker, // 上一任务阻塞原因。
        }
      : null;
    const previous = previousContext
      ? `\n上一轮任务状态（仅作为承接判断资料）：${JSON.stringify(previousContext)}`
      : "";
    const pauseRule = options.allowTaskPause === false
      ? "当前入口不支持追问或阻塞结束，缺少字段时使用已有事实继续完成，不要编造。"
      : "需要补充时使用 request_resume_input，确认无法安全执行时使用 report_resume_blocker。";
    const taskProfile = options.taskProfile
      ? `\n# 当前按钮任务\n目标：${options.taskProfile.objective}\n完成条件：${options.taskProfile.successCondition}\n${options.taskProfile.instructions}`
      : "";
    return `# 任务运行规则\n当前入口：${options.source}。先调用 plan_resume_task，根据用户原始消息、入口、近期对话和上一轮任务建立任务契约。文字回复不能代替 requiredEffects 声明的真实业务效果；继续或修正上一任务时沿用上一任务效果，需要不同效果时建立 new 任务。任务阶段与完成结果由运行时依据工具事实维护。${pauseRule}${taskProfile}${previous}`;
  };

  return {
    // 任务控制工具用于规划、等待补充和记录阻塞。
    controlTools: options.allowTaskPause === false
      ? [planTaskTool]
      : [planTaskTool, requestInputTool, reportBlockerTool],
    // 包装业务工具并记录真实执行证据。
    wrapTools,
    // 最终答案提交前的通用完成检查。
    beforeFinal,
    // 提供给同一 Agent 的任务运行上下文。
    buildContext,
    // 返回可持久化的当前任务快照。
    getTask: () => cloneTask(task),
  };
};
