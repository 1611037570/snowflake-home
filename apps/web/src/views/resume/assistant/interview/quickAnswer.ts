export { useInterviewQuickAnswer } from "@snowflake/resume-agent";

// 快速回答仅路由到逐题互动流程，押题报告与自我介绍不提供入口。
const QUICK_ANSWER_FLOW_KEYS = new Set([
  "specializedInterview",
  "aptitudeHrInterview",
  "resumeInterview",
]);

export const supportsQuickAnswer = (flowKey: string) => QUICK_ANSWER_FLOW_KEYS.has(flowKey);
