import { describe, expect, it, vi } from "vitest";
import { flows, suggestions } from "./flows";
import { supportsInterviewEarlyEnd } from "./interview/flows";
import { aptitudeHrInterview } from "./interview/skills/skill_aptitude_hr_interview";
import { interviewPrediction } from "./interview/skills/skill_interview_prediction";
import { specializedInterview } from "./interview/skills/skill_specialized_interview";
import { onDemandSkills } from "./skills/registry";

vi.mock("@/stores", () => ({
  useResumeStore: () => ({ selectedModule: [], currentData: undefined }),
}));

// 面试功能需同时具备入口、引导流程与专用技能
describe("interviewFlows", () => {
  it("逐题面试流程均支持提前结束", () => {
    expect(supportsInterviewEarlyEnd("specializedInterview")).toBe(true);
    expect(supportsInterviewEarlyEnd("aptitudeHrInterview")).toBe(true);
    expect(supportsInterviewEarlyEnd("resumeInterview")).toBe(true);
    expect(supportsInterviewEarlyEnd("interviewPrediction")).toBe(false);
  });

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

  it("专项面试提前结束时按完成度保守评分", () => {
    const instructions = specializedInterview().instructions;
    const result = flows.specializedInterview!.build(["业务面"]);

    expect(result.userContent).toContain("随时点击“提前结束”");
    expect(instructions).toContain("已完成回答均分 × 完成度");
    expect(instructions).toContain("结果可能不准确");
  });

  it("行测与 HR 面试确认后读取整份简历", () => {
    const flow = flows.aptitudeHrInterview!;
    const result = flow.build(["开始综合评估"]);

    expect(flow.steps[0]?.options).toEqual(["开始综合评估"]);
    expect(result.userContent).toContain("先进行带建议时限的行测模拟");
    expect(result.requestContext).toEqual({ resumeScope: "all" });
  });

  it("行测与 HR 面试入口和技能均已注册", () => {
    const suggestion = suggestions.find((item) => item.flow === "aptitudeHrInterview");

    expect(suggestion?.intro?.badge).toBe("综合评估");
    expect(onDemandSkills.some((createSkill) => createSkill().id === "aptitude_hr_interview")).toBe(
      true,
    );
  });

  it("行测与 HR 面试约束双阶段、限时说明与综合报告", () => {
    const instructions = aptitudeHrInterview().instructions;

    expect(instructions).toContain("言语理解三题、数量关系三题、判断推理四题");
    expect(instructions).toContain("不得声称系统能自动计时");
    expect(instructions).toContain("沟通表达与情绪管理反馈");
  });

  it("行测与 HR 面试提前结束时计入未完成项目", () => {
    const instructions = aptitudeHrInterview().instructions;
    const flow = flows.aptitudeHrInterview!;
    const result = flow.build(["开始综合评估"]);

    expect(flow.steps[0]?.question).toContain("可随时提前结束");
    expect(result.userContent).toContain("避免阶段性分数虚高");
    expect(instructions).toContain("未完成题目按零分计入完成度折算总分");
    expect(instructions).toContain("结果可能不准确");
  });
});
