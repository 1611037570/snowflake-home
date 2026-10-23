import type { ReactTool } from "@snowflake/ai";
import type { SkillResource } from "../types";
import type {
  ResumeAgentCompletionPolicy,
  ResumeAgentEvidenceKind,
  ResumeAgentRequiredEffect,
  ResumeAgentToolResultStatus,
  ResumeAgentVerifiedChange,
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
  // 执行轮次耗尽，任务尚未通过完成校验。
  | "incomplete"
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
  // 本次真实执行是否改变了业务数据；未标记时不参与无写入判断。
  changed?: boolean;
  // 工具结果额外证明的业务事实。
  facts?: string[];
  // 工具实际写入生成的报告改动条目。
  verifiedChanges?: ResumeAgentVerifiedChange[];
  // 是否复用了同一参数首次执行的结果。
  replayed?: boolean;
};

// 运行观测事件：宿主据此还原任务建立、降级与完成校验的过程。
export type ResumeAgentTraceEvent =
  // 模型已完成本轮任务规划。
  | { type: "planned"; task: ResumeAgentTaskState }
  // 规划缺失时按工具效果建立了隐式任务。
  | { type: "implicit"; task: ResumeAgentTaskState; tool: string }
  // 最终回答前的完成校验结论。
  | { type: "verdict"; completed: boolean; reason: string | null };

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
  // 按钮任务需要优先加载的通用内容技能。
  preferredCapabilityId?: string;
  // 当前按钮任务是否允许修改模块展示标题。
  allowModuleTitleEdit?: boolean;
  // 按钮已经明确的任务目标。
  objective: string;
  // 按钮任务固定要求产生的业务效果。
  requiredEffects: ResumeAgentRequiredEffect[];
  // 按钮任务固定的用户可核对完成条件。
  successCondition: string;
  // 仅在该按钮任务中注入的目标范围与输出要求。
  instructions: string;
  // 由运行时核对的按钮任务完成条件。
  completionPolicy: ResumeAgentCompletionPolicy;
  // 最终正文的专用校验，返回原因时要求模型修正。
  validateFinal?: (answer: string, evidence: ResumeAgentTaskEvidence[]) => string | null;
};

export type CreateResumeAgentTaskRuntimeOptions = {
  // 本次请求使用的任务标识。
  taskId: string;
  // 任务入口来源。
  source: string;
  // 本轮注册的业务工具，运行时据此把工具约束翻译成验收要求。
  tools?: ReactTool[];
  // 规划缺省时用于回填目标的用户原始需求。
  fallbackObjective?: string;
  // 上一轮未结束或可承接的任务状态。
  previousTask?: ResumeAgentTaskState;
  // 当前允许作为任务能力的技能。
  capabilities?: SkillResource[];
  // 功能入口已经明确指定的主要能力。
  preferredCapabilityId?: string;
  // 功能入口已经明确指定的必需业务效果。
  fixedRequiredEffects?: ResumeAgentRequiredEffect[];
  // 功能入口已经明确指定的完成条件。
  fixedSuccessCondition?: string;
  // 当前入口是否允许以等待补充或阻塞状态暂停任务。
  allowTaskPause?: boolean;
  // 按钮入口直接指定的任务配置，可优先选择其声明的通用技能。
  taskProfile?: ResumeAgentTaskProfile;
  // 每次业务工具形成证据后通知宿主，用于展示和撤回等交互状态。
  onEvidence?: (evidence: ResumeAgentTaskEvidence) => void;
  // 任务建立、降级与完成校验时通知宿主，用于运行观测。
  onTrace?: (event: ResumeAgentTraceEvent) => void;
};

export const TASK_RELATIONS: ResumeAgentTaskRelation[] = ["new", "continue", "revise"];

export const TASK_REQUIRED_EFFECTS: ResumeAgentRequiredEffect[] = [
  "resume_change",
  "draft_submit",
  "language_update",
];

// 任务快照与当前运行时隔离，避免后续状态推进改写历史消息。
export const cloneResumeAgentTask = (
  task?: ResumeAgentTaskState,
): ResumeAgentTaskState | undefined => task ? JSON.parse(JSON.stringify(task)) : undefined;
