import { describe, expect, it } from "vitest";
import { onDemandSkills } from "./registry";
import { resumeOptimization } from "./skill_resume_optimization";

describe("promptSafety", () => {
  it("通用方法论禁止迁移示例事实", () => {
    expect(resumeOptimization().instructions).toContain("均不得迁移到用户简历");
  });

  it("全部行业示例声明不得迁移指标", () => {
    // 行业提示统一声明示例边界，避免模型把演示数据写入用户简历
    const industries = onDemandSkills
      .map((createSkill) => createSkill())
      .filter((skill) => skill.id.startsWith("industry_"));

    expect(industries).toHaveLength(11);
    industries.forEach((skill) => {
      expect(skill.instructions).toContain("主体、动作和指标不得迁移");
    });
  });
});
