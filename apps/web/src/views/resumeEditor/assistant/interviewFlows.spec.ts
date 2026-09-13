import { describe, expect, it, vi } from "vitest";
import { flows, suggestions } from "./flows";
import { onDemandSkills } from "./skills/registry";
import { interviewPrediction } from "./skills/skill_interview_prediction";

vi.mock("@/stores", () => ({
  useResumeStore: () => ({ selectedModule: [], currentData: undefined }),
}));

// 面试功能需同时具备入口、引导流程与专用技能
describe("interviewFlows", () => {
  it("面试押题收集 JD 并读取整份简历", () => {
    const flow = flows.interviewPrediction!;
    const result = flow.build(["负责后端服务开发"]);

    expect(flow.steps).toHaveLength(1);
    expect(result.userContent).toContain("<job_description>");
    expect(result.requestContext).toEqual({ resumeScope: "all" });
  });

  it("面试押题入口与技能均已注册", () => {
    expect(suggestions.some((item) => item.flow === "interviewPrediction")).toBe(true);
    expect(onDemandSkills.some((createSkill) => createSkill().id === "interview_prediction")).toBe(
      true,
    );
  });

  it("面试押题约束题型、答案依据与输出报告", () => {
    const instructions = interviewPrediction().instructions;

    expect(instructions).toContain("技术或专业、项目或经历、行为三个类别");
    expect(instructions).toContain("不得替用户补造职责、技术、数据或结果");
    expect(instructions).toContain("准备反馈报告");
  });
});
