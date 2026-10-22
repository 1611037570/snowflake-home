import type { ChatMessage, ReactConfig, ReactTool } from "@snowflake/ai";
import type { SkillResource } from "../types";
import { createResumeAiReactRunner } from "../request";
import type { ResumeAiAgent } from "../request";
import { resolveResumeAgentTaskProfile } from "../tasks/registry";
import { createResumeAgentTaskRuntime } from "./resumeAgentTask";
import type { ResumeAgentRequiredEffect } from "./types";
import type {
  ResumeAgentTaskEvidence,
  ResumeAgentTaskProfile,
  ResumeAgentTaskState,
} from "./taskTypes";

export type CreateResumeAgentSessionOptions = {
  // 本次请求使用的任务标识。
  taskId: string;
  // 任务入口标识，普通对话使用 chat。
  source: string;
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
  reactConfig: Omit<ReactConfig, "tools" | "initialTool" | "beforeFinal" | "onFinal">;
  // 每次业务工具形成证据后通知宿主。
  onEvidence?: (evidence: ResumeAgentTaskEvidence) => void;
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
  const taskRuntime = createResumeAgentTaskRuntime({
    taskId: options.taskId,
    source: options.source,
    previousTask: options.previousTask,
    capabilities: taskProfile ? [] : options.capabilities,
    preferredCapabilityId: options.preferredCapabilityId,
    fixedRequiredEffects: options.fixedRequiredEffects,
    fixedSuccessCondition: options.fixedSuccessCondition,
    allowTaskPause: options.allowTaskPause,
    taskProfile,
    onEvidence: options.onEvidence,
  });
  const guardTool = (tool: ReactTool): ReactTool => ({
    ...tool,
    // 失效请求不得继续读取或修改当前业务状态。
    execute: (args) => {
      options.assertActive?.();
      return tool.execute(args);
    },
  });
  const tools = [
    ...taskRuntime.controlTools.map(guardTool),
    ...taskRuntime.wrapTools(options.tools.map(guardTool)),
  ];
  const runner = createResumeAiReactRunner(options.agent ?? "xiaoZhou", {
    ...options.reactConfig,
    tools,
    initialTool: "plan_resume_task",
    beforeFinal: taskRuntime.beforeFinal,
    onFinal: (answer) => options.onFinal?.(answer, taskRuntime.getTask()),
  });

  return {
    run: (messages) => {
      options.assertActive?.();
      const requestMessages = messages.map((message) => ({ ...message }));
      const requestIndex = requestMessages.map((message) => message.role).lastIndexOf("user");
      if (requestIndex !== -1) {
        // 任务运行上下文紧邻本轮用户消息，避免由页面层重复处理注入顺序。
        requestMessages.splice(requestIndex, 0, {
          role: "system",
          content: taskRuntime.buildContext(),
        });
      }
      return runner.run(requestMessages);
    },
    abort: () => runner.abort(),
    getTask: taskRuntime.getTask,
  };
};
