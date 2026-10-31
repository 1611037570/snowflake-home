import type { ChatMessage, ReactConfig, ReactTool } from "@snowflake/ai";
import type { SkillResource } from "../types";
import { createAgent } from "@snowflake/agent";
import { getResumeAiModel } from "../request/client";
import { getResumeAiMessage } from "../request/messages";
import type { ResumeAiAgent } from "../request";
import { resolveResumeAgentTaskProfile } from "../tasks/registry";
import { createResumeAgentTaskRuntime } from "./resumeAgentTask";
import type { ResumeAgentRequiredEffect } from "./types";
import type {
  ResumeAgentTaskEvidence,
  ResumeAgentTaskProfile,
  ResumeAgentTaskState,
  ResumeAgentTraceEvent,
} from "./taskTypes";

export type CreateResumeAgentSessionOptions = {
  // 本次请求使用的任务标识。
  taskId: string;
  // 任务入口标识，普通对话使用 chat。
  source: string;
  // 规划缺省时用于回填目标的用户原始需求。
  fallbackObjective?: string;
  // 上一轮可供省略表达承接的任务状态。
  previousTask?: ResumeAgentTaskState;
  // 当前可供任务规划器选择的轻量能力目录。
  capabilities: SkillResource[];
  // 当前入口可供 Agent 调用的业务工具。
  tools: ReactTool[];
  // 功能入口直接指定的任务配置；省略时根据 source 从注册器按需解析。
  taskProfile?: ResumeAgentTaskProfile;
  // 功能入口已经明确指定的主要能力。
  preferredCapabilityId?: string;
  // 功能入口已经明确指定的必需业务效果。
  fixedRequiredEffects?: ResumeAgentRequiredEffect[];
  // 功能入口已经明确指定的完成条件。
  fixedSuccessCondition?: string;
  // 当前入口是否允许以等待补充或阻塞状态暂停任务。
  allowTaskPause?: boolean;
  // 使用的模型角色，省略时使用简历助手模型。
  agent?: ResumeAiAgent;
  // 宿主提供的 ReAct 展示和流式回调，工具与任务验收由会话统一注入。
  reactConfig: Omit<ReactConfig, "tools" | "initialTool" | "beforeFinal" | "onIncomplete" | "onFinal">;
  // 每次业务工具形成证据后通知宿主。
  onEvidence?: (evidence: ResumeAgentTaskEvidence) => void;
  // 任务建立、降级与完成校验时通知宿主，用于运行观测。
  onTrace?: (event: ResumeAgentTraceEvent) => void;
  // 最终回答生成后同时返回任务快照。
  onFinal?: (answer: string, task?: ResumeAgentTaskState) => void;
  // 工具执行和异步装配前检查当前请求是否仍然有效。
  assertActive?: () => void;
};

export type ResumeAgentSession = {
  // 使用统一任务上下文执行本轮消息。
  run: (messages: ChatMessage[]) => Promise<string>;
  // 中止当前 ReAct 执行。
  abort: () => void;
  // 获取可持久化的当前任务快照。
  getTask: () => ResumeAgentTaskState | undefined;
};

// 创建一次请求范围内的简历 Agent 会话，统一收口任务、工具与 ReAct 装配。
export const createResumeAgentSession = async (
  options: CreateResumeAgentSessionOptions,
): Promise<ResumeAgentSession> => {
  options.assertActive?.();
  const taskProfile = options.taskProfile ?? await resolveResumeAgentTaskProfile(options.source);
  options.assertActive?.();
  // 业务工具先于任务运行时准备好，规划阶段即可读到工具约束并据此推导验收要求。
  const businessTools = options.tools;
  const taskRuntime = createResumeAgentTaskRuntime({
    taskId: options.taskId,
    source: options.source,
    fallbackObjective: options.fallbackObjective,
    previousTask: options.previousTask,
    // 按钮优先使用指定技能，同时保留按实际任务选择其他能力的空间。
    capabilities: options.capabilities,
    preferredCapabilityId: taskProfile?.preferredCapabilityId ?? options.preferredCapabilityId,
    fixedRequiredEffects: options.fixedRequiredEffects,
    fixedSuccessCondition: options.fixedSuccessCondition,
    allowTaskPause: options.allowTaskPause,
    taskProfile,
    tools: businessTools,
    onEvidence: options.onEvidence,
    onTrace: options.onTrace,
  });
  const tools = [
    ...taskRuntime.controlTools,
    ...taskRuntime.wrapTools(businessTools),
  ];
  const model = getResumeAiModel(options.agent ?? "xiaoZhou");
  if (!model?.apiKey || !model.url || !model.model) throw new Error(getResumeAiMessage("modelUnset"));
  // 通用层只负责运行，简历专用的上下文、规划与完成证据仍由本包提供。
  const runner = createAgent({
    model, // 保留简历助手原有模型绑定与未配置提示。
    tools, // 当前授权的简历业务工具及任务控制工具。
    assertActive: options.assertActive, // 统一阻止失效请求调用工具。
    instructions: taskRuntime.buildContext, // 仅简历智能体注入字段与写作规则。
    reactConfig: {
      ...options.reactConfig,
      initialTool: "plan_resume_task", // 保留原有简历任务规划入口。
      beforeFinal: taskRuntime.beforeFinal, // 保留简历业务完成证据校验。
      onIncomplete: taskRuntime.onIncomplete, // 保留简历未完成结果处理。
      onFinal: (answer) => options.onFinal?.(answer, taskRuntime.getTask()), // 保留任务快照回调。
    }, // 简历行为不迁入通用智能体。
  });

  return {
    run: runner.run,
    abort: () => runner.abort(),
    getTask: taskRuntime.getTask,
  };
};
