import { useInterviewQuickAnswer as createInterviewQuickAnswer } from "@snowflake/resume-agent";
import { useResumeContext } from "../context/useResumeContext";

// 页面负责注入当前简历的数据授权上下文，领域任务只消费稳定接口。
export const useInterviewQuickAnswer = () => createInterviewQuickAnswer(useResumeContext());

// 快速回答仅路由到逐题互动流程，押题报告与自我介绍不提供入口。
const QUICK_ANSWER_FLOW_KEYS = new Set([
  "specializedInterview",
  "aptitudeHrInterview",
  "resumeInterview",
]);

export const supportsQuickAnswer = (flowKey: string) => QUICK_ANSWER_FLOW_KEYS.has(flowKey);
