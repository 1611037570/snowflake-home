import { beforeEach, describe, expect, it, vi } from "vitest";
import { flows } from "./flows";
import { defaultPrompt } from "./skills/prompt_default";
import { resumeOneKeyOptimize } from "./skills/skill_resume_one_key_optimize";
import { resumeOptimization } from "./skills/skill_resume_optimization";
import { resumeScore } from "./skills/skill_resume_score";
import { resumeWriting } from "./skills/skill_resume_writing";

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

  it("一键优化仅执行有依据的必要增删且不受普通优化默认限制", () => {
    const oneKeyInstructions = resumeOneKeyOptimize().instructions;
    const optimizationInstructions = resumeOptimization().instructions;

    expect(oneKeyInstructions).toContain("必要的新增、修改、删除与排序操作");
    expect(oneKeyInstructions).toContain("没有安全且必要的改动时允许不调用写入工具");
    expect(oneKeyInstructions).toContain("不得写入纯占位记录");
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
    expect(instructions).toContain("totalScore 取所有非 null 得分的算术平均值并四舍五入");
    expect(instructions).toContain('"name": "职业稳定性", "score": null');
    expect(resumeScore().instructions).toContain("## 统一评分标尺");
    expect(instructions).toContain("遵循 resume_score 的统一评分标尺");
  });

  it("专项技能输出协议优先于默认输出格式", () => {
    const instructions = defaultPrompt().instructions;

    expect(instructions).toContain("以该技能的输出格式为准");
    expect(instructions).toContain("| 翻译 | resume_translate |");
    expect(instructions).not.toContain("resume_translate、update_resume_language");
  });

  it("任务技能、数据与行业知识按无歧义顺序加载", () => {
    const instructions = defaultPrompt().instructions;

    expect(instructions).toContain("命中任务分派时先读取对应任务技能");
    expect(instructions).toContain("在任务技能之后调用名称匹配目标行业");
  });

  it("按求职现状形成精准建议与高效润色闭环", () => {
    expect(resumeScore().instructions).toContain("问题—求职影响—具体行动—预期改善");
    expect(resumeOptimization().instructions).toContain("用最少改动提升信息密度和专业度");
    expect(resumeOneKeyOptimize().instructions).toContain(
      "优先级｜问题｜具体行动｜预期改善",
    );
    expect(resumeOneKeyOptimize().instructions).toContain("均以“【维度名称】”开头");
    expect(resumeOneKeyOptimize().instructions).toContain(
      '"message": "【信息完整度】目标岗位所需的联系方式未填写完整"',
    );
    expect(resumeOneKeyOptimize().instructions).toContain(
      '"highlights": ["【职业契合度】目标岗位相关成果已前置，岗位主线更清晰"]',
    );
  });

  it("写入后基于最新数据验证并避免重复提交", () => {
    expect(defaultPrompt().instructions).toContain("只重新构造未成功的操作");
    expect(resumeWriting().instructions).toContain("禁止重放已成功操作");
    expect(resumeOneKeyOptimize().instructions).toContain(
      "写入完成后必须再次调用 read_resume_data 读取整份简历",
    );
  });

  it("明确数据规范的必读条件", () => {
    const instructions = defaultPrompt().instructions;

    expect(instructions).toContain("新增记录、修改模块标题、翻译");
    expect(instructions).toContain("只修改已读取且类型明确的现有文本字段时可不调用");
  });
});
