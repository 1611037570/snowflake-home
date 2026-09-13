import { beforeEach, describe, expect, it, vi } from "vitest";
import { flows } from "./flows";
import { defaultPrompt } from "./skills/prompt_default";
import { resumeOneKeyOptimize } from "./skills/skill_resume_one_key_optimize";
import { resumeOptimization } from "./skills/skill_resume_optimization";
import { resumeScore } from "./skills/skill_resume_score";

const resumeState = vi.hoisted(() => ({
  selectedModule: [] as Array<{ key: string; name: string }>,
  currentData: undefined,
}));

vi.mock("@/stores", () => ({
  useResumeStore: () => resumeState,
}));

describe("oneKeyOptimize", () => {
  beforeEach(() => {
    resumeState.selectedModule = [];
  });

  it("仅在局部模块模式要求整份简历读取授权", () => {
    const authorizationStep = flows.oneKeyOptimize!.steps[0]!;

    expect(authorizationStep.when?.()).toBe(false);
    resumeState.selectedModule = [{ key: "work", name: "工作经历" }];
    expect(authorizationStep.when?.()).toBe(true);
    expect(authorizationStep.cancelAnswers).toContain("拒绝并取消");
  });

  it("一键优化请求固定使用整份简历上下文", () => {
    expect(flows.oneKeyOptimize!.build(["后端开发", "职场人"]).requestContext).toEqual({
      resumeScope: "all",
    });
  });

  it("一键优化明确执行必要增删且不受普通优化默认限制", () => {
    const oneKeyInstructions = resumeOneKeyOptimize().instructions;
    const optimizationInstructions = resumeOptimization().instructions;

    expect(oneKeyInstructions).toContain("必要的新增、修改、删除与排序操作");
    expect(oneKeyInstructions).toContain("删除重复句、空洞自评");
    expect(oneKeyInstructions).toContain("不得仅因身份强制要求固定模块");
    expect(oneKeyInstructions).toContain("模块本身不存在时不得写入");
    expect(optimizationInstructions).toContain("以该技能的增删规则为准");
  });

  it("一键优化报告统一使用六大评估维度", () => {
    const instructions = resumeOneKeyOptimize().instructions;

    expect(instructions).toContain(
      "信息完整度、阅读效率、职业契合度、职业成就、发展潜力、职业稳定性",
    );
    expect(instructions).toContain("totalScore 取六项得分的算术平均值并四舍五入");
    expect(resumeScore().instructions).toContain("## 统一评分标尺");
    expect(instructions).toContain("遵循 resume_score 的统一评分标尺");
  });

  it("专项技能输出协议优先于默认输出格式", () => {
    const instructions = defaultPrompt().instructions;

    expect(instructions).toContain("以该技能的输出格式为准");
    expect(instructions).toContain("| 翻译 | resume_translate |");
    expect(instructions).not.toContain("resume_translate、update_resume_language");
  });

  it("按求职现状形成精准建议与高效润色闭环", () => {
    expect(resumeScore().instructions).toContain("问题—求职影响—具体行动—预期改善");
    expect(resumeOptimization().instructions).toContain("用最少改动提升信息密度和专业度");
    expect(resumeOneKeyOptimize().instructions).toContain(
      "优先级｜问题｜具体行动｜预期改善",
    );
  });
});
