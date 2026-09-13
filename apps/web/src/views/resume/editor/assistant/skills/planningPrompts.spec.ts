import { describe, expect, it, vi } from "vitest";
import { flows } from "../flows";
import { defaultPrompt } from "./prompt_default";
import { onDemandSkills } from "./registry";

vi.mock("@/stores", () => ({
  useResumeStore: () => ({ currentData: undefined }),
}));

describe("planningPrompts", () => {
  it("职业规划与人生总结均注册专用技能", () => {
    // 技能注册与默认任务分派必须同步，避免入口请求回退到无约束回答
    const ids = onDemandSkills.map((createSkill) => createSkill().id);
    const instructions = defaultPrompt().instructions;

    expect(ids).toContain("career_planning");
    expect(ids).toContain("life_summary");
    expect(instructions).toContain("| 职业规划 | career_planning |");
    expect(instructions).toContain("| 人生总结 | life_summary |");
  });

  it("依赖全部经历的流程固定读取整份简历", () => {
    expect(flows.careerPlanning!.build([]).requestContext).toEqual({ resumeScope: "all" });
    expect(flows.lifeSummary!.build([]).requestContext).toEqual({ resumeScope: "all" });
  });
});
