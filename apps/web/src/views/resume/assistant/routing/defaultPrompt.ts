import { createDefaultAssistantPrompt } from "@snowflake/resume-agent";

// 常驻执行边界由简历智能体包统一维护。
export const defaultPrompt = () => createDefaultAssistantPrompt();
