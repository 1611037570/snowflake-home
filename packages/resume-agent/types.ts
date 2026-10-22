// AI 技能定义：能力正文由 AI 层维护，助手仅负责选择和装配。
export interface Skill {
  id: string; // 技能稳定标识。
  name: string; // 技能展示名称。
  description: string; // 技能用途说明。
  instructions: string; // 提供给模型的技能正文。
}

// 技能工厂：按需生成技能内容。
export type SkillFactory = () => Skill;

// 技能懒加载入口：助手路由命中后加载对应能力。
export type SkillLoader = () => Promise<Skill>;

// 正文 AI 支持的操作类型。
export type ContentAiAction = "generate" | "polish" | "simplify";
