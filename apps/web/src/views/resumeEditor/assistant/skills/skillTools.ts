import type { ReactTool } from "@/apis/llm/react";
import type { Skill } from "../types";

// 把按需技能注册为只读工具：对话中只暴露名称与描述，需要时由模型调用获取全文
export const createSkillTools = (skills: Skill[]): ReactTool[] =>
  skills.map((skill) => {
    // 只保留技能名与首句用途，避免复制完整 description 增加每轮请求体
    const brief = skill.description.split("。")[0] + "。";
    return {
      name: `load_${skill.id}`,
      description: `读取《${skill.name}》全文。${brief} 正文未随消息提供，需要该技能时调用本工具。`,
      parameters: {
        type: "object",
        properties: {},
      },
      execute: () => ({
        name: skill.name,
        content: skill.instructions,
      }),
    };
  });
