import { describe, expect, it, vi } from "vitest";
import { createResumeAgentTaskRuntime } from "@snowflake/resume-agent/runtime/resumeAgentTask";
import { createProposeResumeEditsTool } from "@snowflake/resume-agent/tools/tool_propose_resume_edits";
import { defineTool } from "@snowflake/resume-agent/tools/defineTool";
import type { ResumeWriteOp } from "@snowflake/resume-agent";
import { registerResumeSchema } from "@/views/resume/shared/resumeSchemaProvider";

registerResumeSchema();

// 运行内核测试：不调用模型，只用工具事实验证任务契约与验收口径
const createRuntime = (options: Record<string, unknown> = {}) =>
  createResumeAgentTaskRuntime({
    taskId: "task-1",
    source: "chat",
    capabilities: [],
    fallbackObjective: "把工作经历第一条改短",
    ...options,
  });

// 只读工具：执行后产生读取证据
const createReadTool = () =>
  defineTool({
    name: "read_resume_data",
    description: "读取简历",
    parameters: { type: "object", properties: {} },
    effect: "read",
    execute: () => ({ data: {} }),
    evaluate: () => ({ status: "success", summary: "已读取当前简历数据" }),
  });

// 写入工具：执行后产生简历写入证据
const createWriteTool = (execute = () => ({ applied: true, changed: [0] })) =>
  defineTool({
    name: "propose_resume_edits",
    description: "写入简历",
    parameters: { type: "object", properties: {} },
    effect: "mutation",
    replayScope: "task",
    execute,
    evaluate: () => ({ status: "success", summary: "已完整执行 1 项简历修改" }),
  });

const plan = (runtime: ReturnType<typeof createRuntime>, args: Record<string, unknown>) =>
  runtime.controlTools.find((tool) => tool.name === "plan_resume_task")!.execute(args);

describe("任务运行验收", () => {
  it("写入前缺少读取证据时拦截收口", async () => {
    const runtime = createRuntime();
    await plan(runtime, { objective: "改简历", requiredEffects: ["resume_change"] });
    const [write] = runtime.wrapTools([createWriteTool()]);

    // 缺少写前读取时写入被工具层拒绝，本轮不产生写入证据，收口继续拦截
    await write!.execute({});
    expect(runtime.beforeFinal()).toContain("资料读取");

    const [read] = runtime.wrapTools([createReadTool()]);
    await read!.execute({});
    // 补齐读取后同一写入工具才被允许执行，读写闭环后放行
    await write!.execute({});
    expect(runtime.beforeFinal()).toBeNull();
  });

  it("缺少前置证据的工具不执行并返回原因", async () => {
    const runtime = createRuntime();
    const language = defineTool({
      name: "update_resume_language",
      description: "同步语言",
      parameters: { type: "object", properties: {} },
      effect: "sync",
      requiresEvidence: ["resume_change"],
      execute: vi.fn(() => ({ updated: true })),
      evaluate: () => ({ status: "success", summary: "已同步简历展示语言" }),
    });
    const [wrapped] = runtime.wrapTools([language]);

    const result = (await wrapped!.execute({ language: "en" })) as Record<string, unknown>;
    expect(result).toMatchObject({ accepted: false, missingRequiredEvidence: ["resume_change"] });
    expect(language.execute).not.toHaveBeenCalled();
  });

  it("规划缺失时按工具效果建立隐式任务并放行", async () => {
    const traces: Array<Record<string, unknown>> = [];
    const runtime = createRuntime({ onTrace: (event: Record<string, unknown>) => traces.push(event) });
    const [read] = runtime.wrapTools([createReadTool()]);
    await read!.execute({});
    const [write] = runtime.wrapTools([createWriteTool()]);
    await write!.execute({});

    const implicit = traces.filter((event) => event.type === "implicit");
    expect(implicit.length).toBeGreaterThan(0);
    expect(runtime.getTask()?.requiredEffects).toContain("resume_change");
    // 读写在正确顺序上完成，即使没有规划也应放行
    expect(runtime.beforeFinal()).toBeNull();
  });

  it("重提已写入的操作不会重复执行", () => {
    const operations: ResumeWriteOp[] = [
      { op: "updateModule", module: "user", field: "name", value: "李四" },
    ];
    const applied: ResumeWriteOp[][] = [];
    const tool = createProposeResumeEditsTool({
      getResumeData: () => ({ user: { title: "个人信息", data: { name: "张三" } } }),
      applyResumeOperations: (list) => {
        applied.push(list);
        return { applied: true, changed: list.map((_, index) => index), added: [], failed: [] };
      },
    });

    const first = tool.execute({ operations }) as Record<string, unknown>;
    const second = tool.execute({ operations }) as Record<string, unknown>;

    expect(first).toMatchObject({ applied: true, changed: [0] });
    // 第二次全部命中已写入意图，只回报跳过，不再落库
    expect(second).toMatchObject({ applied: true, changed: [], duplicated: 1 });
    expect(applied).toHaveLength(1);
  });
});
