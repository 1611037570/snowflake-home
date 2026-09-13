import { describe, expect, it, vi } from "vitest";
import { flows } from "./flows";
import { defaultPrompt } from "./skills/prompt_default";

vi.mock("@/stores", () => ({
  useResumeStore: () => ({ selectedModule: [], currentData: undefined }),
}));

// 依赖完整经历或连续规则的任务必须保持稳定上下文
describe("promptScope", () => {
  it.each(["selfIntro", "resumeInterview", "resumeScore"])(
    "%s 固定读取整份简历",
    (flowName) => {
      const flow = flows[flowName]!;
      const answers =
        flowName === "selfIntro"
          ? ["200字", "专业"]
          : flowName === "resumeInterview"
            ? ["项目深挖", "只继续追问"]
            : [];

      expect(flow.build(answers).requestContext).toEqual({ resumeScope: "all" });
    },
  );

  it("要求多轮任务持续加载原任务技能", () => {
    expect(defaultPrompt().instructions).toContain("均属于该任务的续轮");
    expect(defaultPrompt().instructions).toContain("每一轮都必须重新调用同一任务技能");
  });
});
