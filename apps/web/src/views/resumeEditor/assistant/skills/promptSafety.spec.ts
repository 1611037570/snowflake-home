import { describe, expect, it } from "vitest";
import { onDemandSkills } from "./registry";
import { industryInternet } from "./skill_industry_internet";
import { jobMatch } from "./skill_job_match";
import { resumeCreate } from "./skill_resume_create";
import { resumeOptimization } from "./skill_resume_optimization";
import { resumeTranslate } from "./skill_resume_translate";

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

  it("专项任务声明事实与执行边界", () => {
    expect(jobMatch().instructions).toContain("用户选择只分析时，不调用 propose_resume_edits");
    expect(resumeCreate().instructions).toContain("不得为了完整度补造");
    expect(resumeTranslate().instructions).toContain("不得把局部翻译声称为整份翻译");
    expect(industryInternet().instructions).toContain("### 2.7 安全");
  });
});
