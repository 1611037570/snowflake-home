import type { ReactTool } from "@/apis/llm/react";
import type { Skill } from "../types";

export type ResumeAgentExpectedResult =
  // 通过文字回答、分析或建议完成任务。
  | "answer"
  // 需要让当前简历数据发生实际变化。
  | "resume_change"
  // 需要提交一份独立的结构化简历草稿。
  | "draft";

export type ResumeAgentTaskStatus =
  // Agent 仍需继续读取、执行或核对结果。
  | "active"
  // 缺少必要事实，等待用户补充后继续原任务。
  | "waiting_input"
  // 当前条件下无法安全完成，需要向用户说明原因。
  | "blocked"
  // 已取得满足完成条件的工具证据。
  | "completed";

export type ResumeAgentTaskEvidence = {
  // 产生证据的工具名称。
  tool: string;
  // 证据类型，用于区分读取、现有简历变更与草稿提交。
  kind: "read" | "resume_change" | "draft_submit";
  // 工具结果的简短事实摘要。
  summary: string;
};

export type ResumeAgentTaskState = {
  // 本次任务的稳定标识。
  id: string;
  // 任务来源，例如普通聊天或具体功能入口。
  source: string;
  // 用户最终希望达成的目标。
  objective: string;
  // 用户期待的最终结果类型。
  expectedResult: ResumeAgentExpectedResult;
  // 当前目标模块、记录或内容范围。
  scope: string;
  // 可观察的任务完成条件。
  completion: string;
  // 当前任务生命周期状态。
  status: ResumeAgentTaskStatus;
  // 等待或阻塞时需要向用户说明的原因。
  statusReason?: string;
  // 本轮选中的主要通用能力标识。
  capabilityId?: string;
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
  // 当前允许作为主要任务能力的技能。
  capabilities?: Skill[];
  // 功能入口已经明确指定的主要能力。
  preferredCapabilityId?: string;
  // 功能入口已经明确指定的结果类型。
  fixedExpectedResult?: ResumeAgentExpectedResult;
  // 当前入口是否允许以等待补充或阻塞状态暂停任务。
  allowTaskPause?: boolean;
};

const EXPECTED_RESULTS: ResumeAgentExpectedResult[] = ["answer", "resume_change", "draft"];
const TASK_STATUSES: ResumeAgentTaskStatus[] = ["active", "waiting_input", "blocked", "completed"];

const isObject = (value: unknown): value is Record<string, any> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const cloneTask = (task?: ResumeAgentTaskState): ResumeAgentTaskState | undefined =>
  task ? JSON.parse(JSON.stringify(task)) : undefined;

// 同一个 Agent 负责建立任务、记录工具证据并检查最终答案是否满足完成条件。
export const createResumeAgentTaskRuntime = (options: CreateResumeAgentTaskRuntimeOptions) => {
  let task: ResumeAgentTaskState | undefined;
  const previousTask = cloneTask(options.previousTask);
  const capabilityMap = new Map((options.capabilities ?? []).map((skill) => [skill.id, skill]));
  const capabilityIds = [...capabilityMap.keys()];
  const successfulMutations = new Map<string, unknown>();

  const taskTool: ReactTool = {
    name: "set_resume_task",
    description:
      "根据用户原始消息、入口和上一轮任务建立或更新本轮任务状态。判断用户需要文字回答、当前简历实际变化还是独立草稿，不按词语机械匹配。选择 capabilityId 后会返回对应能力全文。",
    parameters: {
      type: "object",
      properties: {
        objective: {
          type: "string",
          description: "用户最终希望达成的目标，结合近期对话理解省略表达。",
        },
        expectedResult: {
          type: "string",
          enum: EXPECTED_RESULTS,
          description: "answer 表示只回答；resume_change 表示修改当前简历；draft 表示提交独立草稿。",
        },
        scope: {
          type: "string",
          description: "本轮涉及的模块、记录或内容范围；无法确定时如实说明。",
        },
        completion: {
          type: "string",
          description: "可观察的完成条件，修改和草稿任务必须以对应工具成功结果为准。",
        },
        status: {
          type: "string",
          enum: TASK_STATUSES,
          description: "任务状态；首次建立通常为 active，缺少信息时使用 waiting_input。",
        },
        statusReason: {
          type: "string",
          description: "waiting_input 或 blocked 时需要向用户说明的具体原因。",
        },
        capabilityId: {
          type: "string",
          ...(capabilityIds.length ? { enum: capabilityIds } : {}),
          description: "本轮最相关的通用能力标识；没有合适能力时省略。",
        },
      },
      required: ["objective", "expectedResult", "scope", "completion", "status"],
      additionalProperties: false,
    },
    execute: (args) => {
      if (
        typeof args?.objective !== "string" || !args.objective.trim() ||
        !EXPECTED_RESULTS.includes(args.expectedResult) ||
        typeof args.scope !== "string" || !args.scope.trim() ||
        typeof args.completion !== "string" || !args.completion.trim() ||
        !TASK_STATUSES.includes(args.status) ||
        (["waiting_input", "blocked"].includes(args.status) &&
          (typeof args.statusReason !== "string" || !args.statusReason.trim()))
      ) {
        // 参数不完整时把原因留给 ReAct 自行修正，避免任务理解工具直接中断整轮请求。
        return { accepted: false, error: "任务状态参数不完整，请补全目标、结果类型、范围、完成条件和状态原因后重试" };
      }
      const expectedResult = options.fixedExpectedResult ?? args.expectedResult;
      const capabilityId = options.preferredCapabilityId ?? args.capabilityId ?? task?.capabilityId;
      const capability = capabilityId ? capabilityMap.get(capabilityId) : undefined;
      task = {
        id: options.taskId,
        source: options.source,
        objective: args.objective.trim(),
        expectedResult,
        scope: args.scope.trim(),
        completion: args.completion.trim(),
        status: args.status,
        statusReason: ["waiting_input", "blocked"].includes(args.status) &&
          typeof args.statusReason === "string" && args.statusReason.trim()
          ? args.statusReason.trim()
          : undefined,
        capabilityId: capability?.id,
        evidence: task?.evidence ?? [],
      };
      return {
        accepted: true,
        task,
        previousTask,
        capability: capability
          ? { id: capability.id, name: capability.name, instructions: capability.instructions }
          : null,
      };
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
      return;
    }
    if (tool === "submit_generated_resume" && result.accepted === true) {
      task.evidence.push({ tool, kind: "draft_submit", summary: "已成功提交结构化简历草稿" });
    }
  };

  const wrapTools = (tools: ReactTool[]): ReactTool[] =>
    tools.map((tool) => ({
      ...tool,
      // 业务工具返回后立即记录事实证据，最终判断不依赖模型自述。
      execute: async (args) => {
        const isMutation = ["propose_resume_edits", "submit_generated_resume"].includes(tool.name);
        const mutationKey = isMutation ? `${tool.name}:${JSON.stringify(args)}` : "";
        // 同一任务内完全相同的成功操作直接复用结果，避免 ReAct 重试造成重复写入。
        if (mutationKey && successfulMutations.has(mutationKey)) {
          return successfulMutations.get(mutationKey);
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
    if (!task) return "尚未建立本轮任务，请先调用 set_resume_task。";
    const requiredKind = task.expectedResult === "resume_change"
      ? "resume_change"
      : task.expectedResult === "draft"
        ? "draft_submit"
        : null;
    // 成功工具证据优先于旧的等待状态，避免已经完成的任务被再次拦截。
    if (requiredKind && task.evidence.some((item) => item.kind === requiredKind)) {
      task.status = "completed";
      task.statusReason = undefined;
      return null;
    }
    if (task.status === "waiting_input" || task.status === "blocked") {
      // 非对话入口无法承接补充信息，继续依据入口已有事实完成结果。
      if (options.allowTaskPause === false) {
        return "当前入口不能暂停等待补充信息。请使用已经提供的资料继续完成任务，不要把缺失字段作为失败条件，也不要编造事实。";
      }
      if (task.expectedResult !== "answer" && !task.evidence.some((item) => item.kind === "read")) {
        return "在判断缺少信息或无法执行前，先调用当前可用的读取工具核对已有简历或入口资料。";
      }
      return null;
    }
    if (task.expectedResult === "answer") {
      task.status = "completed";
      return null;
    }
    return `本轮任务尚未达到完成条件：${task.completion}。请继续使用可用工具完成任务；如果缺少必要事实，调用 set_resume_task 将状态更新为 waiting_input 后再向用户提问。`;
  };

  const buildContext = () => {
    const previous = previousTask ? `\n上一轮任务状态：${JSON.stringify(previousTask)}` : "";
    const waitingRule = options.allowTaskPause === false
      ? "当前入口不支持追问，缺少字段时使用已有事实继续完成，不要编造。"
      : "必要事实确实缺失时保留任务并等待用户补充。";
    return `# 任务运行规则\n先调用 set_resume_task，根据用户原始消息、入口和近期对话建立本轮任务。修改和草稿任务以工具结果为完成证据。${waitingRule}${previous}`;
  };

  return {
    // 任务状态工具，通常作为 ReAct 首轮指定工具。
    taskTool,
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
