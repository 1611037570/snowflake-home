import { describe, expect, it, vi } from "vitest";
import { createProposeResumeEditsTool } from "./tool_propose_resume_edits";

describe("createProposeResumeEditsTool", () => {
  it("校验通过后只向领域入口提交一次完整操作列表", () => {
    const applyResumeOperations = vi.fn(() => ({
      applied: true,
      changed: [0],
      added: [],
      failed: [],
    }));
    const tool = createProposeResumeEditsTool({
      getResumeData: () => ({
        user: { title: "个人信息", data: { name: "张三" } },
      }),
      applyResumeOperations,
    });
    const operations = [{ op: "updateModule", module: "user", field: "name", value: "李四" }];

    expect(tool.execute({ operations })).toEqual({
      applied: true,
      changed: [0],
      added: [],
      failed: [],
      errors: [],
    });
    expect(applyResumeOperations).toHaveBeenCalledTimes(1);
    expect(applyResumeOperations).toHaveBeenCalledWith(operations);
  });

  it("校验失败时不调用领域入口", () => {
    const applyResumeOperations = vi.fn();
    const tool = createProposeResumeEditsTool({
      getResumeData: () => ({
        user: { title: "个人信息", data: { name: "张三" } },
      }),
      applyResumeOperations,
    });

    const result = tool.execute({
      operations: [{ op: "updateModule", module: "user", field: "unknown", value: "内容" }],
    });

    expect(result).toMatchObject({ applied: false });
    expect(applyResumeOperations).not.toHaveBeenCalled();
  });
});
