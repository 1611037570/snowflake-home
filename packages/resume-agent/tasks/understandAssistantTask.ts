import { runResumeAiTask } from "../request";
import type { ResumeAiMessage, ResumeAiTask } from "../request";
import type { Skill } from "../types";

// 每轮先理解用户目标，再把简短任务交给 ReAct 自行决定工具调用。
export type AssistantTaskUnderstanding = {
  // 用户本轮实际要达成的目标，包括省略表达所承接的上下文。
  objective: string;
  // 预期执行方向，区分直接操作、分析建议与需要澄清的情况。
  approach: string;
  // 与本轮目标最相关的任务技能；没有合适技能时为空。
  skillId: string | null;
};

export type AssistantTaskInput = {
  // 当前消息及近期对话，仅用于理解本轮任务。
  messages: ResumeAiMessage[];
  // 用户主动点击的功能入口；普通聊天为空。
  entryFlow?: string;
  // 上轮任务技能，用于理解“更新”“继续”等承接表达。
  previousSkillId?: string;
  // 可选任务技能的名称与用途，供模型按语义选择。
  skills: Pick<Skill, "id" | "name" | "description">[];
};

const TASK_UNDERSTANDING: ResumeAiTask<AssistantTaskInput> = {
  agent: "xiaoZhou",
  stream: false,
  retryCount: 0,
  extraOptions: { thinking: { type: "disabled" } },
  buildMessages: ({ messages, entryFlow, previousSkillId, skills }) => [
    {
      role: "system",
      content: `你只负责理解本轮用户任务，不执行任务、不读取简历，也不代替后续智能体决定工具调用。结合近期对话理解省略表达，区分直接要求操作与询问、讨论、建议或否定；不要用动词表机械匹配。用户点击的功能入口是明确的任务来源，普通聊天中提到功能名称不等于点击入口。不要添加用户未提出的目标。\n仅返回 JSON：{"objective":"一句话任务目标","approach":"一句话说明应执行、分析或先澄清的方向","skillId":"最相关的任务技能 id 或 null"}。skillId 只能从给定清单中选择；没有合适技能时用 null。`,
    },
    {
      role: "user",
      content: JSON.stringify({ entryFlow: entryFlow ?? null, previousSkillId: previousSkillId ?? null, skills, messages }),
    },
  ],
};

// 解析失败时交还原始对话给 ReAct，避免前置理解成为执行门槛。
export const understandAssistantTask = async (
  input: AssistantTaskInput,
  signal?: AbortSignal,
  onToken?: (totalTokens: number) => void,
): Promise<AssistantTaskUnderstanding | null> => {
  const text = await runResumeAiTask(TASK_UNDERSTANDING, input, { signal, onToken });
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    const content = text.slice(start, end + 1);
    const value = JSON.parse(content) as Partial<AssistantTaskUnderstanding>;
    if (typeof value.objective !== "string" || !value.objective.trim() ||
      typeof value.approach !== "string" || !value.approach.trim()) return null;
    return {
      objective: value.objective.trim(),
      approach: value.approach.trim(),
      skillId: input.skills.some((skill) => skill.id === value.skillId) ? value.skillId! : null,
    };
  } catch {
    return null;
  }
};
