import type { Skill, SkillResource } from "../types";

// 参考资料目录项只保留标识与名称，用途说明按需从正文读取，避免工具定义常驻大量摘要
const describeCatalog = (resources: SkillResource[]) =>
  resources.map((resource) => `${resource.id}：${resource.name}`).join("\n");

// 简历保持自己的资料目录与工具身份，加载时按分片键只注入目标范围正文
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
          description: "仅 resume_data_contract 使用：只返回该模块的完整字段表与枚举值；省略时返回全部模块的紧凑字段清单。取简历模块 key，如 user、work、education。",
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
        // 分片不受支持时明确告知，避免模型反复带上 module 读取
        chunkUnsupported: Boolean(chunkKey) && !("loadVariant" in resource && resource.loadVariant),
        content: skill.instructions, // 本次按需读取的正文。
      };
    },
  };
};
