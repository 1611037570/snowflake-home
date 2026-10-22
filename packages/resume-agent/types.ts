import type { ResumeAgentCompletionPolicy } from "./runtime/types";

export type SkillRole =
  // 每轮对话始终提供的基础规则。
  | "resident"
  // 由任务契约规划器选择并直接返回正文的任务能力。
  | "task"
  // 执行过程中通过统一读取工具按需加载的参考知识。
  | "reference";

// AI 技能定义：能力正文由 AI 层维护，助手仅负责选择和装配。
export interface Skill {
  id: string; // 技能稳定标识。
  role: SkillRole; // 技能在任务规划与执行阶段承担的职责。
  name: string; // 技能展示名称。
  description: string; // 技能用途说明。
  instructions: string; // 提供给模型的技能正文。
  completionPolicy?: ResumeAgentCompletionPolicy; // 由运行时执行的任务完成策略。
}

// 技能轻量注册项：目录读取不会加载技能正文，只有被任务选中时才调用 load。
export interface SkillRegistration {
  id: string; // 技能稳定标识。
  role: Exclude<SkillRole, "resident">; // 按需技能只参与任务规划或参考知识读取。
  name: string; // 技能展示名称。
  description: string; // 提供给任务规划器或参考工具的用途摘要。
  load: SkillLoader; // 被选中后加载完整技能正文的方法。
}

// 运行时可直接使用完整技能，也可使用尚未加载正文的轻量注册项。
export type SkillResource = Skill | SkillRegistration;

// 技能工厂：按需生成技能内容。
export type SkillFactory = () => Skill;

// 技能懒加载入口：助手路由命中后加载对应能力。
export type SkillLoader = () => Promise<Skill>;

// 统一解析完整技能与轻量注册项，并校验懒加载结果没有串用其他技能。
export const loadSkillResource = async (resource: SkillResource): Promise<Skill> => {
  if ("instructions" in resource) return resource;
  const skill = await resource.load();
  if (
    skill.id !== resource.id ||
    skill.role !== resource.role ||
    skill.name !== resource.name ||
    skill.description !== resource.description
  ) {
    throw new Error(`简历技能注册不一致：${resource.id}`);
  }
  return skill;
};

// 正文 AI 支持的操作类型。
export type ContentAiAction = "generate" | "polish" | "simplify";
