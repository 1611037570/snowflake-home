import type { Skill, SkillResource } from "../types";

// 目录只列标识与名称，用途摘要留在正文里，减少工具声明的固定开销
const describeCatalog = (resources: SkillResource[]) =>
  resources.map((resource) => `${resource.id}：${resource.name}`).join("\n");

// 简历保持自己的资料目录与工具身份，支持按模块只读取局部正文
export const createSkillReferenceTool = (skills: SkillResource[]) => {
  const references = skills.filter((resource) => resource.role === "reference");
  const resourceMap = new Map(references.map((resource) => [resource.id, resource]));
  // 本次请求内已经返回过的正文分片，重复读取不再注入全文
  const delivered = new Set<string>();
  return {
    name: "read_resume_guidance",
    description: `按任务需要读取一项简历参考知识。任务能力正文已由任务规划返回，不通过本工具重复读取。可选资料：\n${describeCatalog(references)}`,
    parameters: {
      type: "object",
      properties: {
        guidanceId: {
          type: "string",
          enum: references.map((resource) => resource.id),
          description: "需要读取的资料标识。",
        },
        module: {
          type: "string",
          description: "仅简历数据规范使用：只返回该模块的字段契约；省略时返回全部模块。取简历模块 key，如 work、education、user。",
        },
      },
      required: ["guidanceId"],
      additionalProperties: false,
    },
    execute: async (args: { guidanceId?: string; module?: string }) => {
      const resource = resourceMap.get(args?.guidanceId ?? "");
      if (!resource) return { accepted: false, error: "未找到对应的参考资料" };
      const chunkKey = typeof args?.module === "string" ? args.module.trim() : "";
      // 同一资料的不同分片分别去重，避免整份正文重复进入上下文
      const deliveryKey = chunkKey ? `${resource.id}@${chunkKey}` : resource.id;
      if (delivered.has(deliveryKey)) {
        return {
          accepted: true, // 当前会话已经取得该资料分片。
          alreadyLoaded: true, // 不重复注入正文。
          id: resource.id, // 已加载资料标识。
          name: resource.name, // 已加载资料名称。
          module: chunkKey || undefined, // 已加载的资料分片。
        };
      }
      let skill: Skill;
      if (chunkKey && "loadVariant" in resource && resource.loadVariant) {
        skill = await resource.loadVariant(chunkKey);
      } else {
        skill = "load" in resource ? await resource.load() : resource;
      }
      if (skill.id !== resource.id || skill.role !== resource.role || skill.name !== resource.name) {
        throw new Error(`参考资料注册不一致：${resource.id}`);
      }
      delivered.add(deliveryKey);
      return {
        accepted: true, // 本次成功读取资料。
        alreadyLoaded: false, // 首次返回正文。
        id: skill.id, // 资料稳定标识。
        name: skill.name, // 资料展示名称。
        module: chunkKey || undefined, // 本次读取的资料分片。
        content: skill.instructions, // 本次按需读取的正文。
      };
    },
  };
};
