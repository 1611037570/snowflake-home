import { beforeEach, describe, expect, it, vi } from "vitest";
import { getXiaoYangLLM } from "@/apis";
import { useResumeContext } from "../resumeContext";
import {
  buildQuickAnswerMessages,
  supportsQuickAnswer,
  useInterviewQuickAnswer,
} from "./quickAnswer";

vi.mock("@/apis", () => ({ getXiaoYangLLM: vi.fn() }));
vi.mock("../resumeContext", () => ({ useResumeContext: vi.fn() }));

describe("interviewQuickAnswer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("固定提示只允许一个基于事实的口述回答", () => {
    const messages = buildQuickAnswerMessages("请介绍项目难点", { project: "真实项目" });

    expect(messages[0]?.content).toContain("只输出一个回答方案");
    expect(messages[0]?.content).toContain("不得虚构经历、职责、技术、数据或结果");
    expect(messages[0]?.content).toContain("不继续提问、不评分、不点评、不修改简历");
    expect(messages[1]?.content).toContain("<question_context>");
    expect(messages[1]?.content).toContain("<resume_data>");
  });

  it("只为逐题面试流程开放快速回答", () => {
    expect(supportsQuickAnswer("specializedInterview")).toBe(true);
    expect(supportsQuickAnswer("aptitudeHrInterview")).toBe(true);
    expect(supportsQuickAnswer("resumeInterview")).toBe(true);
    expect(supportsQuickAnswer("interviewPrediction")).toBe(false);
    expect(supportsQuickAnswer("selfIntro")).toBe(false);
  });

  it("换一个时携带上一版并要求生成不同表达", () => {
    const messages = buildQuickAnswerMessages(
      "请介绍项目难点",
      { project: "真实项目" },
      "上一版回答",
    );

    expect(messages[0]?.content).toContain("必须更换表达结构或回答侧重点");
    expect(messages[1]?.content).toContain("<previous_answer>");
    expect(messages[1]?.content).toContain("上一版回答");
  });

  it("使用无工具且不重试的单次普通模型请求", async () => {
    const sendFn = vi.fn().mockResolvedValue({
      choices: [{ message: { content: "这是一个回答方案" } }],
    });
    const request = vi.fn().mockResolvedValue({ sendFn });
    const beforeRequest = vi.fn();
    const afterRequest = vi.fn();
    vi.mocked(getXiaoYangLLM).mockReturnValue({ protocol: "chatCompletions", request } as any);
    vi.mocked(useResumeContext).mockReturnValue({
      getResumeData: () => ({ project: "真实项目" }),
      beforeRequest,
      afterRequest,
    });

    const { requestQuickAnswer } = useInterviewQuickAnswer();
    const answer = await requestQuickAnswer("请介绍项目难点");

    expect(answer).toBe("这是一个回答方案");
    expect(request).toHaveBeenCalledOnce();
    expect(sendFn).toHaveBeenCalledOnce();
    expect(request.mock.calls[0]?.[0]).toMatchObject({
      isStream: false,
      retryCount: 0,
    });
    expect(request.mock.calls[0]?.[0].options.tools).toBeUndefined();
    expect(beforeRequest).toHaveBeenCalledWith({ resumeScope: "all" });
    expect(afterRequest).toHaveBeenCalledOnce();
  });
});
