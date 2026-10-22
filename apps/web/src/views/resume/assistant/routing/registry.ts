import type { SkillFactory, SkillLoader } from "@snowflake/resume-agent/types";
import {
  resumeReferenceSkills,
  resumeSkillRegistry,
  resumeTaskCapabilities,
} from "@snowflake/resume-agent";
import { defaultPrompt } from "./defaultPrompt";

// 常驻技能：按顺序作为系统消息注入对话
export const residentSkills: SkillFactory[] = [defaultPrompt];

// 兼容本目录现有能力清单检查，实际请求使用轻量注册项，不会预加载全部正文。
export const onDemandSkills: SkillLoader[] = resumeSkillRegistry.map((skill) => skill.load);

// 任务能力由规划工具选中后加载正文。
export const taskCapabilities = resumeTaskCapabilities;

// 参考知识由统一读取工具首次调用时加载正文。
export const referenceSkills = resumeReferenceSkills;
