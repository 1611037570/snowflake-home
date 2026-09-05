import type { ReactTool } from "@/apis/llm/react";
import type { Skill } from "../types";

// 把按需技能注册为只读工具：对话中只暴露名称与描述，需要时由模型调用获取全文
export const createSkillTools = (skills: Skill[]): ReactTool[] =>
  skills.map((skill) => ({
    name: `load_${skill.id}`,
    description: `${skill.name}。${skill.description} 正文未随消息提供，符合上述场景时先调用本工具读取全文。`,
    parameters: {
      type: "object",
      properties: {},
    },
    execute: () => ({
      name: skill.name,
      content: skill.instructions,
    }),
  }));
