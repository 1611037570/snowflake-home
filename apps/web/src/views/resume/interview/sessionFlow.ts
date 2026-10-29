import type { InterviewAction, InterviewTaskInput } from "@snowflake/interview-agent";
import { INTERVIEW_INTRO_PHASE, INTERVIEW_INTRO_SECONDS, isInterviewComplete, isPreparationMode } from "./config";
import type { InterviewSession } from "./types";

export const isInterviewHelperAction = (action: InterviewAction | null): action is "hint" | "reference" =>
  action === "hint" || action === "reference";

// 请求、暂停与界面展示始终定位同一份输出。
export const getInterviewOutput = (session: InterviewSession, action: InterviewAction) => {
  if (action === "preparation") return session.preparation;
  if (action === "report") return session.report;
  const turn = session.turns.at(-1);
  return action === "question" ? turn?.question : turn?.[action];
};

// 所有操作权限从持久化记录派生，不再额外维护容易失步的生成状态。
export const getInterviewSessionState = (session: InterviewSession) => {
  const latestTurn = session.turns.at(-1);
  const submittedTurns = session.turns.filter((turn) => turn.submitted);
  const preparation = isPreparationMode(session.config.mode);
  const reviewing = session.pendingAction === "report" || session.report.status !== "empty";
  const introduction = latestTurn?.phase === INTERVIEW_INTRO_PHASE;
  const generating = session.pendingAction !== null && getInterviewOutput(session, session.pendingAction)?.status === "generating";
  const answerReady = !preparation && !reviewing && !!latestTurn && !latestTurn.submitted && latestTurn.question.status === "complete";
  const remainingSeconds = Math.max(0, Math.ceil(INTERVIEW_INTRO_SECONDS - (latestTurn?.durationSeconds || 0)));
  const canSubmit = session.status === "active" && answerReady && !generating && session.pendingAction === null;
  const canAnswer = canSubmit && (!introduction || remainingSeconds > 0);
  // 推进与请求权限使用同一份状态，避免操作入口再次遍历历史并重复判断。
  const nextAction: InterviewAction | null = session.status === "completed" ? null
    : preparation ? "preparation"
    : reviewing || isInterviewComplete(session.config, submittedTurns) ? "report"
    : answerReady ? null : "question";
  return {
    latestTurn, // 当前待完成或最近提交的轮次。
    submittedTurns, // 唯一允许进入模型历史的已提交轮次。
    preparation, // 当前分类是否只生成准备材料。
    reviewing, // 是否已进入复盘，进入后不能回到出题或作答。
    introduction, // 当前轮次是否为独立开场。
    generating, // 当前待办对应的输出是否正在生成。
    answerReady, // 当前是否存在已出题但未提交的回答位置。
    remainingSeconds, // 开场剩余秒数，暂停后沿用累计用时。
    canSubmit, // 是否允许确认提交或明确跳过，到时后仍可提交。
    canAnswer, // 是否允许文字或语音继续写入草稿。
    canUseHelp: canAnswer && !introduction, // 正式作答时才能打开辅助。
    canRequestHelp: answerReady && !introduction && (session.pendingAction === null || isInterviewHelperAction(session.pendingAction)), // 当前题就绪时可请求或重试辅助。
    nextAction, // 开始、提交、恢复共用的下一步动作，已就绪题目直接作答。
  };
};

// 只提交实际完成的历史，未提交题目与草稿不混入复盘或能力评价。
export const createInterviewTaskInput = (session: InterviewSession, action: InterviewAction): InterviewTaskInput => {
  const state = getInterviewSessionState(session);
  return {
    config: session.config, // 本场固定的岗位、年限与训练设置。
    resume: session.resumeSnapshot, // 可选的脱敏参考简历。
    turns: state.submittedTurns.map((turn) => ({
      phase: turn.phase, // 本轮实际所属阶段。
      question: turn.question.content, // 本轮实际提出的题目。
      answer: turn.answer, // 用户确认提交的回答。
      skipped: turn.skipped, // 是否主动跳过。
      assisted: turn.assisted, // 是否实际看过辅助内容。
      durationSeconds: Math.round(turn.durationSeconds), // 实际作答秒数。
    })), // 历史包含开场，但正式题数由各类流程独立统计。
    question: isInterviewHelperAction(action) ? state.latestTurn?.question.content || "" : "", // 辅助只针对当前已就绪的题目。
    previousReference: action === "reference" ? state.latestTurn?.reference.content || "" : "", // 更换参考回答时避免重复上一版。
    phase: action === "report" ? state.submittedTurns.at(-1)?.phase || "尚未作答" : state.latestTurn?.phase || "面试准备", // 复盘仅采用已提交阶段。
    endedEarly: session.endedEarly, // 是否未达到本类规定轮次便结束。
  };
};
