import type { ReactTool } from "@snowflake/ai";
import { loadSkillResource } from "../types";
import type {
  ResumeAgentCompletionPolicy,
  ResumeAgentRequiredEffect,
  ResumeAgentTool,
  ResumeAgentToolEffect,
} from "./types";
import {
  evaluateResumeAgentCompletion,
  resolveResumeAgentCompletionPolicy,
  type ResolvedResumeAgentCompletionPolicy,
} from "./completionPolicy";
import { createResumeAgentToolExecution } from "./toolExecution";
import {
  cloneResumeAgentTask,
  TASK_RELATIONS,
  TASK_REQUIRED_EFFECTS,
  type CreateResumeAgentTaskRuntimeOptions,
  type ResumeAgentTaskRelation,
  type ResumeAgentTaskState,
} from "./taskTypes";

// 工具效果对应的必需业务效果，用于规划缺失时建立隐式任务
const TOOL_EFFECT_TARGETS: Record<ResumeAgentToolEffect, ResumeAgentRequiredEffect | undefined> = {
  read: undefined,
  mutation: "resume_change",
  submit: "draft_submit",
  sync: "language_update",
};

// 模型未声明完成条件时按任务效果生成可核对的默认条件
const resolveDefaultSuccessCondition = (effects: ResumeAgentRequiredEffect[]) => {
  if (effects.includes("resume_change")) return "当前简历已按用户要求完成写入";
  if (effects.includes("draft_submit")) return "已提交符合用户要求的结构化草稿";
  if (effects.includes("language_update")) return "简历展示语言已同步";
  return "已向用户给出所需结果";
};

// 同一个 Agent 只负责规划与行动，任务阶段和完成结果由运行时依据工具事实维护。
export const createResumeAgentTaskRuntime = (options: CreateResumeAgentTaskRuntimeOptions) => {
  let task: ResumeAgentTaskState | undefined;
  // 规划缺失时的任务仍可由正式规划接管，已有工具证据必须保留。
  let implicitTask = false;
  const toolExecution = createResumeAgentToolExecution(() => task, options.onEvidence);
  const previousTask = cloneResumeAgentTask(options.previousTask);
  const capabilityMap = new Map((options.capabilities ?? []).map((skill) => [skill.id, skill]));
  const capabilityIds = [...capabilityMap.keys()];
  const capabilityCatalog = [...capabilityMap.values()]
    .map((skill) => `${skill.id}：${skill.name}，${skill.description}`)
    .join("\n");
  const capabilityDescription = capabilityCatalog
    ? `完成本轮任务最相关的任务能力标识；没有合适能力时传空数组。可选能力：\n${capabilityCatalog}`
    : "当前入口没有可选任务能力，传空数组。";
  let completionPolicy: ResolvedResumeAgentCompletionPolicy = {
    requiredEffects: [], // 建立任务后写入最终任务效果。
    requiredEvidence: [], // 建立任务后再按必需效果和能力填充。
    readAfterEvidence: [], // 建立任务后再合并写后读取要求。
    requiredFacts: [], // 建立任务后再合并业务事实要求。
    evidenceOrder: [], // 建立任务后再合并工具执行顺序。
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
      required: options.source === "chat" && previousTask
        ? ["relation", "objective", "requiredEffects"]
        : ["objective", "requiredEffects"],
      additionalProperties: false,
    },
    execute: async (args) => {
      if (task && !implicitTask) {
        // 正式任务只建立一次，避免执行中重新规划后丢失已取得的证据。
        return { accepted: false, error: "本轮任务已经建立，请继续执行当前任务" };
      }
      // 缺少效果数组不能默认为纯回复任务，否则修改诉求会被误判为已完成。
      if (!Array.isArray(args?.requiredEffects)) {
        return { accepted: false, error: "请明确提供 requiredEffects；仅需文字回复时传空数组" };
      }
      // 效果枚举写错会直接改变验收口径，必须让模型改对而不是静默丢弃。
      const rawEffects: unknown[] = args.requiredEffects;
      const unknownEffect = rawEffects.find(
        (effect) => !TASK_REQUIRED_EFFECTS.includes(effect as ResumeAgentRequiredEffect),
      );
      if (unknownEffect !== undefined) {
        return {
          accepted: false,
          error: `未知的必需效果 ${String(unknownEffect)}，可选值：${TASK_REQUIRED_EFFECTS.join("、")}`,
        };
      }
      const effects = rawEffects as ResumeAgentRequiredEffect[];
      // 缺省字段按用户原始需求和效果补齐，避免参数不全导致整轮请求无法建立任务
      const objective =
        typeof args?.objective === "string" && args.objective.trim()
          ? args.objective.trim()
          : options.fallbackObjective?.trim() || "处理用户本轮请求";
      const scope =
        typeof args?.scope === "string" && args.scope.trim() ? args.scope.trim() : "未明确指定";
      // 有上一任务时必须明确新任务、继续或修正，不能把省略表达静默当成新任务。
      if (options.source === "chat" && previousTask && !TASK_RELATIONS.includes(args?.relation)) {
        return { accepted: false, error: "请明确 relation 为 new、continue 或 revise" };
      }
      // 明确功能入口和没有上一任务的对话都从新任务开始，避免误承接历史目标。
      const relation: ResumeAgentTaskRelation =
        options.source === "chat" && previousTask && TASK_RELATIONS.includes(args?.relation)
          ? (args.relation as ResumeAgentTaskRelation)
          : "new";
      const requestedCapabilityIds = (Array.isArray(args?.capabilityIds) ? args.capabilityIds : []).filter(
        (id: unknown): id is string => typeof id === "string" && capabilityMap.has(id),
      );
      const continuedCapabilityIds = relation === "new" ? [] : previousTask?.capabilityIds ?? [];
      const selectedCapabilityIds = [
        ...(options.preferredCapabilityId ? [options.preferredCapabilityId] : []),
        ...requestedCapabilityIds,
        ...(requestedCapabilityIds.length ? [] : continuedCapabilityIds),
      ].filter((id, index, list) => capabilityMap.has(id) && list.indexOf(id) === index).slice(0, 3);
      // 规划阶段只加载真正被选中的能力正文，其余目录项保持轻量。
      const selectedCapabilities = await Promise.all(
        selectedCapabilityIds.map((id) => loadSkillResource(capabilityMap.get(id)!)),
      );
      const plannedEffects = options.taskProfile?.requiredEffects ??
        options.fixedRequiredEffects ??
        (relation !== "new" && previousTask
          ? previousTask.requiredEffects
          : effects);
      const policies = [
        options.taskProfile?.completionPolicy,
        ...selectedCapabilities.map((capability) => capability.completionPolicy),
      ].filter((policy): policy is ResumeAgentCompletionPolicy => Boolean(policy));
      // 正式规划接管隐式任务时保留实际执行过的业务效果和工具证据。
      const effectiveEffects = [...new Set([
        ...plannedEffects,
        ...(implicitTask ? task?.requiredEffects ?? [] : []),
      ])];
      const existingEvidence = implicitTask ? task?.evidence ?? [] : [];
      const resolvedPolicy = resolveResumeAgentCompletionPolicy(effectiveEffects, policies);
      task = {
        id: options.taskId,
        source: options.source,
        relation,
        objective: options.taskProfile?.objective ?? objective,
        scope,
        requiredEffects: resolvedPolicy.requiredEffects,
        successCondition: options.taskProfile?.successCondition ??
          options.fixedSuccessCondition ??
          (typeof args?.successCondition === "string" && args.successCondition.trim()
            ? args.successCondition.trim()
            : resolveDefaultSuccessCondition(resolvedPolicy.requiredEffects)),
        capabilityIds: selectedCapabilityIds,
        phase: "planned",
        evidence: existingEvidence,
      };
      implicitTask = false;
      // 完成条件由任务效果与本轮选中的能力共同决定，不依赖模型自行声明完成。
      completionPolicy = resolvedPolicy;
      // 观测：记录本轮任务契约，便于宿主还原验收口径。
      options.onTrace?.({ type: "planned", task: cloneResumeAgentTask(task)! });
      return {
        accepted: true,
        task,
        capabilities: selectedCapabilities.map((capability) => {
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
      if (task.requiredEffects.length && !toolExecution.hasFreshRead()) {
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
      if (task.requiredEffects.length && !toolExecution.hasFreshRead()) {
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

  // 规划缺失时按入口契约和实际工具效果建立隐式任务，保留按钮的验收策略。
  const ensureImplicitTask = (tool?: ResumeAgentTool) => {
    const target = tool?.taskMeta ? TOOL_EFFECT_TARGETS[tool.taskMeta.effect] : undefined;
    // 正式任务由规划结果决定验收口径，不再被工具效果覆盖
    if (task && !implicitTask) return;
    if (task && (!target || task.requiredEffects.includes(target))) return;
    const effects = [
      ...(options.taskProfile?.requiredEffects ?? options.fixedRequiredEffects ?? []),
      ...(task?.requiredEffects ?? []),
      ...(target ? [target] : []),
    ];
    const resolvedPolicy = resolveResumeAgentCompletionPolicy(
      [...new Set(effects)],
      options.taskProfile ? [options.taskProfile.completionPolicy] : [],
    );
    completionPolicy = resolvedPolicy;
    task = {
      id: options.taskId,
      source: options.source,
      relation: "new", // 隐式任务不承接历史目标。
      objective: options.taskProfile?.objective ?? task?.objective ?? options.fallbackObjective?.trim() ?? "处理用户本轮请求",
      scope: task?.scope ?? "未明确指定",
      requiredEffects: resolvedPolicy.requiredEffects,
      successCondition: options.taskProfile?.successCondition ?? options.fixedSuccessCondition ??
        task?.successCondition ?? resolveDefaultSuccessCondition(resolvedPolicy.requiredEffects),
      capabilityIds: task?.capabilityIds ?? [],
      phase: task?.phase ?? "planned",
      evidence: task?.evidence ?? [],
    };
    implicitTask = true;
    console.warn("[简历助手] 未建立任务契约，已按工具效果建立隐式任务:", {
      source: options.source,
      tool: tool?.name ?? "入口任务",
      requiredEffects: resolvedPolicy.requiredEffects,
    });
    // 观测：降级建任务必须可见，否则无法解释验收口径为何放宽。
    options.onTrace?.({ type: "implicit", task: cloneResumeAgentTask(task)!, tool: tool?.name ?? "入口任务" });
  };

  const beforeFinal = () => {
    // 明确入口即使模型跳过规划，也必须执行入口约定的真实业务效果。
    if (!task && (options.taskProfile || options.fixedRequiredEffects?.length)) ensureImplicitTask();
    if (!task || (implicitTask && !task.requiredEffects.length)) {
      // 只读降级仍需确认用户究竟要求回复还是写入，不凭已读取就判完成。
      const reason = "尚未理解本轮任务，请调用 plan_resume_task 明确目标与必需业务效果。";
      options.onTrace?.({ type: "verdict", completed: false, reason });
      return reason;
    }
    if (task.phase === "waiting" || task.phase === "blocked") return null;
    const result = evaluateResumeAgentCompletion(
      task.evidence,
      completionPolicy,
      options.allowTaskPause !== false,
    );
    if (result.completed) {
      task.phase = "completed";
      task.pendingInput = undefined;
      task.blocker = undefined;
      // 观测：放行最终回答时记录结论。
      options.onTrace?.({ type: "verdict", completed: true, reason: null });
      return null;
    }
    task.phase = "verifying";
    // 观测：拦截过早收口时记录拦截原因，排障依赖这条信号。
    options.onTrace?.({ type: "verdict", completed: false, reason: result.retryMessage });
    return result.retryMessage;
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
    // 包装业务工具并记录真实执行证据；执行前补齐隐式任务。
    wrapTools: (tools: ReactTool[]) => {
      const wrapped = toolExecution.wrapTools(tools);
      return wrapped.map((tool, index) => {
        const source = tools[index] as ResumeAgentTool;
        return {
          ...tool,
          execute: (args: unknown) => {
            ensureImplicitTask(source);
            return tool.execute(args);
          },
        };
      });
    },
    // 最终答案提交前的通用完成检查。
    beforeFinal,
    // 提供给同一 Agent 的任务运行上下文。
    buildContext,
    // 返回可持久化的当前任务快照。
    getTask: () => cloneResumeAgentTask(task),
  };
};
