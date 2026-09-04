import resumeDataContractRaw from "./resume-data-contract.md?raw";
import type { Skill } from "../types";

// 正文起点：元信息区结束后的固定标题
const BODY_MARKER = "# 角色与目标";

// 从技能 md 中解析元信息与正文，正文用于注入模型
function parseSkill(raw: string): Skill {
  const bodyIndex = raw.indexOf(BODY_MARKER);
  const meta = bodyIndex === -1 ? raw : raw.slice(0, bodyIndex);
  const name = meta.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? "";
  const descMatch = meta.match(/description:\s*\|\s*\n([\s\S]*?)\n-{5,}\s*$/);
  const description = descMatch?.[1]?.trim() ?? "";
  const instructions = bodyIndex === -1 ? raw : raw.slice(bodyIndex).trim();
  return { name, description, instructions };
}

// 简历数据编写规范技能：约束模型按简历 JSON 契约生成 data
export const resumeDataContractSkill: Skill = parseSkill(resumeDataContractRaw);
