import type { ReactTool } from "@snowflake/ai";
import { loadSkillResource } from "../types";
import type {
  ResumeAgentCompletionPolicy,
  ResumeAgentRequiredEffect,
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

// 同一个 Agent 只负责规划与行动，任务阶段和完成结果由运行时依据工具事实维护。
export const createResumeAgentTaskRuntime = (options: CreateResumeAgentTaskRuntimeOptions) => {
  let task: ResumeAgentTaskState | undefined;
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
      required: ["relation", "objective", "scope", "requiredEffects", "successCondition", "capabilityIds"],
      additionalProperties: false,
    },
    execute: async (args) => {
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
      // 规划阶段只加载真正被选中的能力正文，其余目录项保持轻量。
      const selectedCapabilities = await Promise.all(
        selectedCapabilityIds.map((id) => loadSkillResource(capabilityMap.get(id)!)),
      );
      const plannedEffects = options.taskProfile?.requiredEffects ??
        options.fixedRequiredEffects ??
        (relation !== "new" && previousTask
          ? previousTask.requiredEffects
          : args.requiredEffects as ResumeAgentRequiredEffect[]);
      const policies = [
        options.taskProfile?.completionPolicy,
        ...selectedCapabilities.map((capability) => capability.completionPolicy),
      ].filter((policy): policy is ResumeAgentCompletionPolicy => Boolean(policy));
      const resolvedPolicy = resolveResumeAgentCompletionPolicy(plannedEffects ?? [], policies);
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

  const beforeFinal = () => {
    if (!task) return "尚未建立本轮任务，请先调用 plan_resume_task。";
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
      return null;
    }
    task.phase = "verifying";
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
    // 包装业务工具并记录真实执行证据。
    wrapTools: toolExecution.wrapTools,
    // 最终答案提交前的通用完成检查。
    beforeFinal,
    // 提供给同一 Agent 的任务运行上下文。
    buildContext,
    // 返回可持久化的当前任务快照。
    getTask: () => cloneResumeAgentTask(task),
  };
};
