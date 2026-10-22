import type { ReactTool } from "@/apis/llm/react";
import type { Skill } from "../types";

export type ResumeAgentTaskRelation =
  // 用户开始了与上一轮无关的新任务。
  | "new"
  // 用户继续完成上一轮尚未结束或需要延展的任务。
  | "continue"
  // 用户要求修正上一轮目标、范围或结果。
  | "revise";

export type ResumeAgentTaskOutcome =
  // 通过文字回答、分析或建议完成任务。
  | "answer"
  // 需要让当前简历数据发生实际变化。
  | "resume_change"
  // 需要提交一份独立的结构化简历草稿。
  | "draft";

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
  // 产生证据的工具名称。
  tool: string;
  // 证据类型，用于区分读取、现有简历变更与草稿提交。
  kind: "read" | "resume_change" | "draft_submit";
  // 工具结果的简短事实摘要。
  summary: string;
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
  // 用户期待的最终结果类型。
  outcome: ResumeAgentTaskOutcome;
  // 当前目标模块、记录或内容范围。
  scope: string;
  // 本轮选中的通用能力标识。
  capabilityIds: string[];
  // 由运行时维护的当前执行阶段。
  phase: ResumeAgentTaskPhase;
  // 等待用户补充时保存的缺失事实和问题。
  pendingInput?: ResumeAgentPendingInput;
  // 当前任务无法继续时保存的阻塞信息。
  blocker?: ResumeAgentTaskBlocker;
  // 已成功取得的工具执行证据。
  evidence: ResumeAgentTaskEvidence[];
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
  // 功能入口已经明确指定的结果类型。
  fixedOutcome?: ResumeAgentTaskOutcome;
  // 当前入口是否允许以等待补充或阻塞状态暂停任务。
  allowTaskPause?: boolean;
};

const TASK_RELATIONS: ResumeAgentTaskRelation[] = ["new", "continue", "revise"];
const TASK_OUTCOMES: ResumeAgentTaskOutcome[] = ["answer", "resume_change", "draft"];

const isObject = (value: unknown): value is Record<string, any> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const cloneTask = (task?: ResumeAgentTaskState): ResumeAgentTaskState | undefined =>
  task ? JSON.parse(JSON.stringify(task)) : undefined;

// 同一个 Agent 只负责规划与行动，任务阶段和完成结果由运行时依据工具事实维护。
export const createResumeAgentTaskRuntime = (options: CreateResumeAgentTaskRuntimeOptions) => {
  let task: ResumeAgentTaskState | undefined;
  const previousTask = cloneTask(options.previousTask);
  const capabilityMap = new Map((options.capabilities ?? []).map((skill) => [skill.id, skill]));
  const capabilityIds = [...capabilityMap.keys()];
  const successfulMutations = new Map<string, unknown>();

  const planTaskTool: ReactTool = {
    name: "plan_resume_task",
    description:
      "根据用户原始消息、功能入口、近期对话和上一轮任务规划本轮任务。只描述目标与需要的结果，不判断任务是否已经完成。选择 capabilityIds 后会返回对应能力全文。",
    parameters: {
      type: "object",
      properties: {
        relation: {
          type: "string",
          enum: TASK_RELATIONS,
          description: "new 表示新任务；continue 表示继续上一任务；revise 表示修正上一任务。",
        },
        objective: {
          type: "string",
          description: "用户最终希望达成的目标，结合近期对话理解省略表达。",
        },
        outcome: {
          type: "string",
          enum: TASK_OUTCOMES,
          description: "answer 表示文字回复；resume_change 表示修改当前简历；draft 表示提交独立草稿。",
        },
        scope: {
          type: "string",
          description: "本轮涉及的模块、记录或内容范围；无法确定时如实说明。",
        },
        capabilityIds: {
          type: "array",
          items: {
            type: "string",
            ...(capabilityIds.length ? { enum: capabilityIds } : {}),
          },
          maxItems: 3,
          uniqueItems: true,
          description: "完成本轮任务最相关的通用能力标识；没有合适能力时传空数组。",
        },
      },
      required: ["relation", "objective", "outcome", "scope", "capabilityIds"],
      additionalProperties: false,
    },
    execute: (args) => {
      if (
        !TASK_RELATIONS.includes(args?.relation) ||
        typeof args?.objective !== "string" || !args.objective.trim() ||
        !TASK_OUTCOMES.includes(args?.outcome) ||
        typeof args?.scope !== "string" || !args.scope.trim() ||
        !Array.isArray(args?.capabilityIds)
      ) {
        // 参数不完整时把原因留给 ReAct 自行修正，避免任务规划工具中断请求。
        return { accepted: false, error: "任务计划参数不完整，请补全任务关系、目标、结果、范围和能力后重试" };
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
      const outcome = options.fixedOutcome ?? (args.outcome as ResumeAgentTaskOutcome);
      task = {
        id: options.taskId,
        source: options.source,
        relation,
        objective: args.objective.trim(),
        outcome,
        scope: args.scope.trim(),
        capabilityIds: selectedCapabilityIds,
        phase: "planned",
        evidence: [],
      };
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
      if (task.outcome !== "answer" && !task.evidence.some((item) => item.kind === "read")) {
        return { accepted: false, error: "请先读取当前可用的简历或入口资料，再判断需要用户补充什么" };
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
      if (task.outcome !== "answer" && !task.evidence.some((item) => item.kind === "read")) {
        return { accepted: false, error: "请先读取当前可用的简历或入口资料，再判断任务是否无法继续" };
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

  const recordToolResult = (tool: string, result: unknown) => {
    if (!task || !isObject(result)) return;
    if (["read_resume_data", "read_resume_generation_input"].includes(tool) &&
      ("data" in result || "sections" in result)) {
      if (!task.evidence.some((item) => item.kind === "read")) {
        task.evidence.push({
          tool,
          kind: "read",
          summary: tool === "read_resume_data" ? "已读取当前简历数据" : "已读取入口资料",
        });
      }
      task.phase = "reading";
      return;
    }
    if (
      tool === "propose_resume_edits" &&
      result.applied === true &&
      Array.isArray(result.changed) &&
      result.changed.length > 0 &&
      (!Array.isArray(result.failed) || result.failed.length === 0) &&
      (!Array.isArray(result.validationIssues) || result.validationIssues.length === 0) &&
      (!Array.isArray(result.executionIssues) || result.executionIssues.length === 0) &&
      (!Array.isArray(result.remainingIssues) || result.remainingIssues.length === 0)
    ) {
      // 只有完整成功且没有剩余问题的写入，才能作为本轮任务完成证据。
      task.evidence.push({
        tool,
        kind: "resume_change",
        summary: `已成功执行 ${result.changed.length} 项简历修改`,
      });
      task.phase = "verifying";
      return;
    }
    if (tool === "submit_generated_resume" && result.accepted === true) {
      task.evidence.push({ tool, kind: "draft_submit", summary: "已成功提交结构化简历草稿" });
      task.phase = "verifying";
    }
  };

  const wrapTools = (tools: ReactTool[]): ReactTool[] =>
    tools.map((tool) => ({
      ...tool,
      // 业务工具返回后立即记录事实证据，任务阶段不依赖模型自述。
      execute: async (args) => {
        const isMutation = ["propose_resume_edits", "submit_generated_resume"].includes(tool.name);
        const mutationKey = isMutation ? `${tool.name}:${JSON.stringify(args)}` : "";
        // 同一任务内完全相同的成功操作直接复用结果，避免 ReAct 重试造成重复写入。
        if (mutationKey && successfulMutations.has(mutationKey)) {
          return successfulMutations.get(mutationKey);
        }
        if (task && isMutation) {
          task.phase = "acting";
          task.pendingInput = undefined;
          task.blocker = undefined;
        }
        const result = await tool.execute(args);
        recordToolResult(tool.name, result);
        if (
          mutationKey && isObject(result) &&
          ((tool.name === "propose_resume_edits" && result.applied === true) ||
            (tool.name === "submit_generated_resume" && result.accepted === true))
        ) {
          successfulMutations.set(mutationKey, result);
        }
        return result;
      },
    }));

  const beforeFinal = () => {
    if (!task) return "尚未建立本轮任务，请先调用 plan_resume_task。";
    const requiredKind = task.outcome === "resume_change"
      ? "resume_change"
      : task.outcome === "draft"
        ? "draft_submit"
        : null;
    // 成功工具证据优先于旧阶段，避免已经完成的任务被再次拦截。
    if (requiredKind && task.evidence.some((item) => item.kind === requiredKind)) {
      task.phase = "completed";
      task.pendingInput = undefined;
      task.blocker = undefined;
      return null;
    }
    if (task.phase === "waiting" || task.phase === "blocked") return null;
    if (task.outcome === "answer") {
      task.phase = "completed";
      return null;
    }
    task.phase = "verifying";
    return options.allowTaskPause === false
      ? "本轮任务尚未取得所需的工具完成证据。请继续使用已有资料和可用工具完成任务，不要编造事实。"
      : "本轮任务尚未取得所需的工具完成证据。请继续使用可用工具完成任务；确实缺少必要事实时调用 request_resume_input，确认无法安全执行时调用 report_resume_blocker。";
  };

  const buildContext = () => {
    const previousContext = previousTask
      ? {
          id: previousTask.id, // 上一任务标识。
          source: previousTask.source, // 上一任务入口。
          objective: previousTask.objective, // 上一任务目标。
          outcome: previousTask.outcome, // 上一任务结果类型。
          scope: previousTask.scope, // 上一任务作用范围。
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
    return `# 任务运行规则\n当前入口：${options.source}。先调用 plan_resume_task，根据用户原始消息、入口、近期对话和上一轮任务判断新任务、继续或修正。任务阶段与完成结果由运行时依据工具事实维护。${pauseRule}${previous}`;
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
