import { describe, expect, it } from "vitest";
import { createResumeAgentToolExecution } from "../runtime/toolExecution";
import type { ResumeAgentTaskState } from "../runtime/taskTypes";
import type { ResumeAgentTool } from "../runtime/types";
import { validateResumeReportChanges } from "../reports/resumeReport";
import { configureResumeSchema, RESUME_SCHEMA } from "../schema/resumeSchemaRegistry";
import { validateGeneratedResume } from "../tasks/resumeDraftGeneration";

describe("简历智能体执行边界", () => {
  it("写入前必须读取且前次写入会使读取失效", async () => {
    const task = { evidence: [], phase: "planned" } as unknown as ResumeAgentTaskState;
    const execution = createResumeAgentToolExecution(() => task);
    let writes = 0;
    const readTool: ResumeAgentTool = {
      name: "read_resume_data",
      description: "读取简历",
      parameters: { type: "object" },
      execute: () => ({ data: {} }),
      taskMeta: {
        effect: "read",
        evidenceKind: "read",
        evaluate: () => ({ status: "success", summary: "已读取" }),
      },
    };
    const writeTool: ResumeAgentTool = {
      name: "propose_resume_edits",
      description: "修改简历",
      parameters: { type: "object" },
      execute: () => { writes += 1; return { applied: true }; },
      taskMeta: {
        effect: "mutation",
        evidenceKind: "resume_change",
        invalidatesRead: true,
        requiresEvidence: ["read"],
        evaluate: () => ({ status: "success", summary: "已修改", changed: true }),
      },
    };
    const [read, write] = execution.wrapTools([readTool, writeTool]);

    expect(await write!.execute({})).toMatchObject({ accepted: false });
    expect(writes).toBe(0);
    await read!.execute({});
    await write!.execute({});
    expect(writes).toBe(1);
    expect(await write!.execute({})).toMatchObject({ accepted: false });
    expect(writes).toBe(1);
    await read!.execute({});
    await write!.execute({});
    expect(writes).toBe(2);
  });

  it("报告不能声明没有写入证据的模块", () => {
    const report = (module: string, summary = "调整工作内容") => `\`\`\`resume-report\n${JSON.stringify({
      totalScore: null,
      dimensions: ["信息完整度", "阅读效率", "职业契合度", "职业成就", "发展潜力", "职业稳定性"]
        .map((name) => ({ name, score: null })),
      checks: [],
      changes: [{ module, summary }],
      todo: [],
      highlights: [],
      suggestions: [],
    })}\n\`\`\``;
    const evidence = [{
      sequence: 1,
      tool: "propose_resume_edits",
      kind: "resume_change",
      status: "success",
      summary: "已写入",
      changed: true,
      verifiedChanges: [{ module: "工作经历", summary: "调整工作内容" }],
    }] as ResumeAgentTaskState["evidence"];

    expect(validateResumeReportChanges(report("项目经历"), evidence)?.text).toContain("工作经历");
    // 同一模块允许改写成概括性的改动范围，不再逐字比对摘要
    expect(validateResumeReportChanges(report("工作经历", "补充量化成果与组件化细节"), evidence)).toBeNull();
    expect(validateResumeReportChanges(report("工作经历"), evidence)).toBeNull();
  });

  it("草稿提交拒绝未知模块和字段", () => {
    const previous = [...RESUME_SCHEMA];
    configureResumeSchema([{
      key: "user", // 模块稳定标识。
      title: "个人信息", // 模块展示名称。
      kind: "object", // 模块数据形态。
      dataPath: ["data"], // 模块数据路径。
      fields: [{
        key: "name", // 字段稳定标识。
        label: "姓名", // 字段展示名称。
        path: ["data", "name"], // 字段数据路径。
        valueType: "string", // 字段值类型。
        addable: false, // 是否允许补充缺失字段。
        required: true, // 字段是否必填。
      }],
    }]);
    try {
      expect(validateGeneratedResume({ user: { data: { name: "张三" } } })).toBeNull();
      expect(validateGeneratedResume({ unknown: { data: {} } })).toContain("unknown");
      expect(validateGeneratedResume({ user: { data: { invented: "内容" } } })).toContain("invented");
    } finally {
      configureResumeSchema(previous);
    }
  });
});
