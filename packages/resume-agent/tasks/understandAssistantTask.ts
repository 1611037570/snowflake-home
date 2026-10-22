import { runResumeAiTask } from "../request";
import type { ResumeAiMessage, ResumeAiTask } from "../request";
import type { Skill } from "../types";

export type AssistantTaskExpectedResult =
  // 通过文字回答、分析、建议或澄清完成任务。
  | "answer"
  // 需要让现有简历数据发生实际变化。
  | "resume_change"
  // 需要生成一份尚未写入现有简历的结构化草稿。
  | "draft";

// 每轮先理解用户目标，再把简短任务交给 ReAct 自行决定工具调用。
export type AssistantTaskUnderstanding = {
  // 用户本轮实际要达成的目标，包括省略表达所承接的上下文。
  objective: string;
  // 用户期待的最终结果类型，用于区分回复与实际数据操作。
  expectedResult: AssistantTaskExpectedResult;
  // 本轮涉及的简历模块、记录或讨论范围；无法确定时说明未明确。
  scope: string;
  // 可观察的完成条件，用于让 ReAct 判断何时结束任务。
  completion: string;
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
      content: `你只负责把本轮用户意图整理成可执行任务，不执行任务、不读取简历，也不替后续智能体决定工具调用。结合近期对话理解省略表达，判断用户最终期待文字回答、现有简历实际变化，还是一份独立草稿；不要用动词表机械匹配。用户点击的功能入口是明确任务来源，普通聊天中提到功能名称不等于点击入口。不要添加用户未提出的目标。\nexpectedResult 只能是 answer、resume_change 或 draft：询问、讨论、建议、分析与必要澄清使用 answer；用户要求改动当前简历且完成后数据应变化使用 resume_change；新建流程需要返回结构化草稿使用 draft。scope 简述目标模块或记录，未明确时如实说明。completion 描述可观察的完成状态；resume_change 必须以相关数据操作成功为完成条件，draft 必须以草稿成功提交为完成条件。\n仅返回 JSON：{"objective":"一句话任务目标","expectedResult":"answer | resume_change | draft","scope":"一句话说明作用范围","completion":"一句话说明完成条件","skillId":"最相关的通用能力 id 或 null"}。skillId 只能从给定清单中选择；没有合适能力时用 null。`,
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
    const expectedResults: AssistantTaskExpectedResult[] = ["answer", "resume_change", "draft"];
    if (
      typeof value.objective !== "string" || !value.objective.trim() ||
      !expectedResults.includes(value.expectedResult as AssistantTaskExpectedResult) ||
      typeof value.scope !== "string" || !value.scope.trim() ||
      typeof value.completion !== "string" || !value.completion.trim()
    ) return null;
    return {
      objective: value.objective.trim(),
      expectedResult: value.expectedResult as AssistantTaskExpectedResult,
      scope: value.scope.trim(),
      completion: value.completion.trim(),
      skillId: input.skills.some((skill) => skill.id === value.skillId) ? value.skillId! : null,
    };
  } catch {
    return null;
  }
};

// 统一把任务契约交给不同 ReAct 入口，避免页面各自解释任务分析结果。
export const buildAssistantTaskContext = (task: AssistantTaskUnderstanding): string =>
  `# 本轮任务\n目标：${task.objective}\n期望结果：${task.expectedResult}\n作用范围：${task.scope}\n完成条件：${task.completion}\n若与用户原话冲突，以用户原话为准；工具调用自行决定。`;
