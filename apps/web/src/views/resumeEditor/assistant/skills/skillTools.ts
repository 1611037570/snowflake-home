import type { ReactTool } from "@/apis/llm/react";
import type { Skill } from "../types";

// 把技能注册为只读工具：对话中只暴露名称与描述，需要时由模型调用获取全文
export const createSkillTools = (skills: Skill[]): ReactTool[] =>
  skills.map((skill) => ({
    name: `load_${skill.id}`,
    description: `${skill.name}。${skill.description} 技能正文不会随消息提供，涉及简历 data 增删改或需确认字段结构与格式时，先调用本工具读取全文。`,
    parameters: {
      type: "object",
      properties: {},
    },
    execute: () => ({
      name: skill.name,
      content: skill.instructions,
    }),
  }));
