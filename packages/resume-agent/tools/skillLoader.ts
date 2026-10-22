import type { ReactTool } from "@/apis/llm/react";
import type { Skill } from "../types";

// 把参考知识合并成一个只读工具，避免每轮重复发送大量独立工具定义。
export const createSkillReferenceTool = (skills: Skill[]): ReactTool => {
  const references = skills.filter((skill) => skill.role === "reference");
  if (!references.length) throw new Error("简历参考知识不能为空");
  const referenceMap = new Map(references.map((skill) => [skill.id, skill]));
  const loadedReferenceIds = new Set<string>();
  const catalog = references
    .map((skill) => `${skill.id}：${skill.name}，${skill.description}`)
    .join("\n");
  return {
    name: "read_resume_guidance", // 统一参考知识读取工具名。
    description: `按任务需要读取一项简历参考知识。任务能力正文已由任务规划返回，不通过本工具重复读取。可选参考知识：\n${catalog}`, // 工具用途与可选知识目录。
    parameters: {
      type: "object", // 工具参数必须是对象。
      properties: {
        guidanceId: {
          type: "string", // 参考知识标识使用字符串。
          enum: references.map((skill) => skill.id), // 只允许读取已登记的参考知识。
          description: "需要读取的参考知识标识。", // 字段用途说明。
        },
      },
      required: ["guidanceId"], // 每次必须明确选择一项参考知识。
      additionalProperties: false, // 禁止提交未声明参数。
    },
    execute: (args) => {
      const skill = referenceMap.get(args?.guidanceId);
      if (!skill) {
        // 非法标识作为可恢复结果返回，由同一 ReAct 重新选择。
        return {
          accepted: false, // 本次没有读取到参考知识。
          error: "未找到对应的简历参考知识", // 提供给模型的修正原因。
        };
      }
      if (loadedReferenceIds.has(skill.id)) {
        // 同一 ReAct 已经取得过正文时只返回状态，避免重复注入大段参考知识。
        return {
          accepted: true, // 参考知识已经可供当前任务使用。
          alreadyLoaded: true, // 本次没有重复返回正文。
          id: skill.id, // 返回已加载的参考知识标识。
          name: skill.name, // 返回已加载的参考知识名称。
        };
      }
      loadedReferenceIds.add(skill.id);
      return {
        accepted: true, // 本次已成功读取参考知识。
        alreadyLoaded: false, // 本次首次返回参考知识正文。
        id: skill.id, // 返回参考知识稳定标识。
        name: skill.name, // 返回参考知识名称。
        content: skill.instructions, // 返回参考知识正文。
      };
    },
  };
};
