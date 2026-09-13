import { describe, expect, it, vi } from "vitest";
import { flows, suggestions } from "./flows";
import { onDemandSkills } from "./skills/registry";
import { interviewPrediction } from "./skills/skill_interview_prediction";
import { specializedInterview } from "./skills/skill_specialized_interview";

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

  it("专项面试模拟选择方向并读取整份简历", () => {
    const flow = flows.specializedInterview!;
    const result = flow.build(["技术面"]);

    expect(flow.steps[0]?.options).toEqual(["技术面", "业务面"]);
    expect(result.userContent).toContain("技术面专项面试模拟");
    expect(result.requestContext).toEqual({ resumeScope: "all" });
  });

  it("专项面试入口与技能均已注册", () => {
    const suggestion = suggestions.find((item) => item.flow === "specializedInterview");

    expect(suggestion?.intro?.badge).toBe("🔥 最受欢迎");
    expect(onDemandSkills.some((createSkill) => createSkill().id === "specialized_interview")).toBe(
      true,
    );
  });

  it("专项面试约束逐轮追问、即时评分与事实边界", () => {
    const instructions = specializedInterview().instructions;

    expect(instructions).toContain("每轮回复只能包含一个问句");
    expect(instructions).toContain("十分制评分");
    expect(instructions).toContain("不得补造职责、技术、数据、成果或业务背景");
  });
});
