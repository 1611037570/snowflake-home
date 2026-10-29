import { createReferenceTool } from "@snowflake/agent";
import type { SkillResource } from "../types";

// 简历保持自己的资料目录与工具身份，通用层只负责按需加载和本轮去重。
export const createSkillReferenceTool = (skills: SkillResource[]) => createReferenceTool({
  name: "read_resume_guidance", // 保留简历技能使用的参考工具名称。
  description: "按任务需要读取一项简历参考知识。任务能力正文已由任务规划返回，不通过本工具重复读取。", // 简历专属的资料用途。
  resources: skills, // 只使用本轮简历任务提供的参考目录。
});
