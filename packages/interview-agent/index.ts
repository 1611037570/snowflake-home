// 面试页面只通过本包执行任务，不经过简历智能体。
export { hasInterviewModel } from "./model";
export { runInterviewTask } from "./tasks";
export type { RunInterviewTaskOptions } from "./tasks";
export { INTERVIEW_INTRO_PHASE, INTERVIEW_INTRO_SECONDS, getInterviewLocalReply, getInterviewQuestionLimit, getInterviewCompletedCount, getInterviewPhase, getInterviewStages, isInterviewComplete } from "./flow";
export type { InterviewAction, InterviewConfig, InterviewHistoryTurn, InterviewMode, InterviewTaskInput } from "./types";
