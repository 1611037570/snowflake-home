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
  const intro = input.config.mode === "intro";
  // 自我介绍直接使用输入资料生成，不经过参考资料工具循环。
  const hasResume = !intro && action !== "hint" && action !== "clarification" && Object.keys(input.resume).length > 0;
  // 逐题回看按需核对个人事实，题意澄清与答题思路不装配资料工具。
  const focused = action === "hint" || action === "reference" || action === "clarification";
  const requireResume = hasResume && !focused;
  let resumeRead = !requireResume;
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
  if (!intro && !focused) tools.push(createReferenceTool({
    name: "read_interview_guidance", // 面试专属的资料读取入口。
    description: "按当前面试题型读取一项行业参考资料。", // 资料仅用于考察角度，不替代真实经历。
    resources: resumeIndustryKnowledge, // 公共资料不经过简历智能体注册表。
  }));
  const agent = createAgent({
    model: getInterviewModel(), // 面试官角色独立绑定模型，不回退到简历助手。
    tools, // 自我介绍不提供工具，模拟面试只提供只读资料工具。
    assertActive, // 停止后不再执行工具或接收结果。
    instructions, // 当前动作只接收所需的公共规则与本类技能。
    reactConfig: {
      maxSteps: 12, // 允许读取参考资料与修正本轮内容。
      initialTool: requireResume ? "read_interview_resume" : undefined, // 正式出题与复盘先读简历，逐题参考回答按需读取。
      thinking: { type: "disabled" /* 不展示内部思考。 */ }, // 保持面试文本响应方式。
      beforeFinal: (answer) => {
        // 只核对读取与有效正文，不用问号数量限制自然表达或触发重写。
        if (!resumeRead) return "请先调用 read_interview_resume 读取本场参考简历，再完成当前动作。";
        if (!answer.trim()) return "本轮必须返回有效面试内容，请按当前动作重新生成。";
        return null;
      }, // 面试只核对实际读取与当前内容，不经过简历任务账本。
      onIncomplete: () => {
        throw new Error(!resumeRead ? "未能读取本场参考简历，请重试" : action === "question" ? "本轮未能完成出题，请重新生成本题" : "本轮内容未能完成，请重试");
      }, // 重试耗尽按失败处理，不将未完成内容当成可作答题目。
      onContent: (delta) => { if (resumeRead) options.onContent?.(delta); }, // 必须读取简历的动作等读取完成后展示，其他动作直接展示增量。
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
      content: JSON.stringify(intro ? {
        resume: input.resume, // 本次选定的脱敏简历内容。
        background: input.config.background, // 用户提供的经历或补充要求。
        language: input.config.language, // 本次生成使用的语言。
      } : {
        // 只提供当前类型使用的设置，避免口头稿参数干扰模拟面试。
        config: {
          mode: input.config.mode, // 本场训练类型。
          position: input.config.position, // 已确认的目标岗位。
          experienceYears: input.config.experienceYears, // 已确认的工作年限。
          company: input.config.company, // 可选目标公司或行业。
          direction: input.config.mode === "specialized" ? input.config.direction : undefined, // 只有专项面试提供本场训练重点。
          language: input.config.language, // 本轮输出语言。
          jobDescription: input.config.jobDescription, // 可选岗位要求。
          background: input.config.background, // 已确认的补充背景。
        }, // 仅提供本场使用的业务设置。
        history: input.turns, // 出题与复盘提供已提交历史，逐题任务只提供所选题目上下文。
        currentQuestion: focused ? input.question || undefined : undefined, // 澄清与回看时明确提供所选题目。
        clarificationRequest: action === "clarification" ? input.clarificationRequest : undefined, // 澄清疑问不混作正式回答。
        previousReference: action === "reference" ? input.previousReference || undefined : undefined, // 只有更换参考回答时提供上一版。
      }), // 自我介绍直接携带资料，其他动作按权限读取参考简历。
    }])).trim();
  } finally { options.signal?.removeEventListener("abort", abort); }
};
