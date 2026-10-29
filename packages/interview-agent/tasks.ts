import { createAgent, createReferenceTool } from "@snowflake/agent";
import type { ReactTool } from "@snowflake/ai";
import { resumeIndustryKnowledge } from "@snowflake/resume-core";
import { getInterviewModel } from "./model";
import { getInterviewLocalReply } from "./flow";
import { createInterviewPrompt } from "./prompts";
import type { InterviewAction, InterviewTaskInput } from "./types";

export interface RunInterviewTaskOptions {
  signal?: AbortSignal; // 只中止当前面试请求的外部信号。
  onContent?: (delta: string) => void; // 本轮正文增量。
  onToken?: (tokens: number) => void; // 本轮令牌统计。
  onReset?: () => void; // 工具调用或内容重试前清除临时正文。
}

// 面试自行组装规则、只读工具与完成校验，不使用简历智能体的规划或写入验收。
export const runInterviewTask = async (action: InterviewAction, input: InterviewTaskInput, options: RunInterviewTaskOptions = {}): Promise<string> => {
  const assertActive = () => {
    if (!options.signal?.aborted) return;
    const error = new Error("面试生成已停止");
    error.name = "AbortError";
    throw error;
  };
  assertActive();
  const localReply = getInterviewLocalReply(action, input);
  if (localReply !== null) {
    options.onContent?.(localReply);
    assertActive();
    return localReply;
  }
  const instructions = await createInterviewPrompt(action, input);
  assertActive();
  const hasResume = Object.keys(input.resume).length > 0;
  let resumeRead = !hasResume;
  const tools: ReactTool[] = [];
  if (hasResume) tools.push({
    name: "read_interview_resume", // 只读取本场参考简历，不调用简历助手工具。
    description: "读取本场固定的脱敏参考简历，返回全部模块标题和业务内容，不含媒体与编辑状态。", // 明确本轮只读范围。
    parameters: { type: "object" /* 参数类型。 */, properties: {} /* 无需额外参数。 */, additionalProperties: false /* 不接受扩大范围的参数。 */ }, // 只读取本场完整快照。
    execute: () => {
      const snapshot = JSON.parse(JSON.stringify(input.resume));
      resumeRead = true;
      return snapshot;
    }, // 返回独立业务副本，不提供写入或编辑器访问能力。
  });
  tools.push(createReferenceTool({
    name: "read_interview_guidance", // 面试专属的资料读取入口。
    description: "按当前面试题型读取一项行业参考资料。", // 资料仅用于考察角度，不替代真实经历。
    resources: resumeIndustryKnowledge, // 公共资料不经过简历智能体注册表。
  }));
  const agent = createAgent({
    model: getInterviewModel(), // 面试官角色独立绑定模型，不回退到简历助手。
    tools, // 仅提供本场快照和行业参考资料。
    assertActive, // 停止后不再执行工具或接收结果。
    instructions, // 当前动作只接收所需的公共规则与本类技能。
    reactConfig: {
      maxSteps: 12, // 允许读取参考资料与修正本轮内容。
      initialTool: hasResume ? "read_interview_resume" : undefined, // 有简历时优先读取，无简历时直接作答。
      thinking: { type: "disabled" /* 不展示内部思考。 */ }, // 保持面试文本响应方式。
      beforeFinal: (answer) => {
        if (!resumeRead) return "请先调用 read_interview_resume 读取本场参考简历，再完成当前动作。";
        if (!answer.trim()) return "本轮必须返回有效面试内容，请按当前动作重新生成。";
        if (action === "question" && (answer.match(/[?？]/g)?.length || 0) > 1) return "本轮只提出一个考察问题，保留必要反馈后提出唯一问题，不合并多个问题。";
        return null;
      }, // 面试只核对实际读取与当前内容，不经过简历任务账本。
      onIncomplete: () => {
        throw new Error(!resumeRead ? "未能读取本场参考简历，请重试" : action === "question" ? "本轮未能完成出题，请重新生成本题" : "本轮内容未能完成，请重试");
      }, // 重试耗尽按失败处理，不将未完成内容当成可作答题目。
      onContent: (delta) => { if (resumeRead) options.onContent?.(delta); }, // 有简历时真实读取后才展示正文。
      onToken: options.onToken, // 本轮独立令牌统计。
      onAct: () => options.onReset?.(), // 清除工具调用前的临时文字。
      onFinalRetry: () => options.onReset?.(), // 不叠加校验重试的正文。
    }, // 工具循环仍由通用基础包处理。
  });
  const abort = () => agent.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  try {
    assertActive();
    return (await agent.run([{
      role: "user", // 本轮固定设置与真实作答。
      content: JSON.stringify({
        config: input.config, // 开始时确认的训练设置。
        history: input.turns, // 已提交问答与辅助标记。
        currentQuestion: input.question || undefined, // 辅助所针对的题目，无题目时省略。
        previousReference: input.previousReference || undefined, // 更换表达时提供上一版，其余请求省略。
      }), // 参考简历只由只读工具提供。
    }])).trim();
  } finally { options.signal?.removeEventListener("abort", abort); }
};
