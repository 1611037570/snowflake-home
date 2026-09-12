import { describe, expect, it, vi } from "vitest";
import { executeResumeOperations } from "@/stores/modules/resume/resumeOperations";
import { createResumeOperationBuffer } from "./resumeOperationBuffer";
import { createProposeResumeEditsTool } from "./tools/tool_propose_resume_edits";

describe("resume write flow", () => {
  it("从真实字段契约校验后延迟整批写入简历数据", () => {
    const data: any = {
      user: { ui: { title: "个人信息" }, data: { name: "张三" } },
      work: {
        ui: { title: "工作经历" },
        data: [
          {
            collapsed: [],
            name: "甲公司",
            post: "工程师",
            time: ["2024.01", "2025.01"],
            content: "<p>负责开发</p>",
          },
        ],
      },
    };
    const target = {
      updateModuleField: (module: string, field: string, value: unknown) => {
        data[module].data[field] = value;
        return true;
      },
      updateModuleTitle: (module: string, title: string) => {
        data[module].ui.title = title;
        return true;
      },
      updateRecordField: (module: string, index: number, field: string, value: unknown) => {
        data[module].data[index][field] = value;
        return true;
      },
      addDataRecord: (module: string) =>
        data[module].data.push({
          collapsed: [],
          name: "",
          post: "",
          time: [],
          content: "",
        }) - 1,
      removeDataRecord: (module: string, index: number) =>
        data[module].data.splice(index, 1).length > 0,
      moveDataRecord: (module: string, from: number, to: number) => {
        const [record] = data[module].data.splice(from, 1);
        data[module].data.splice(to, 0, record);
        return true;
      },
    };
    const apply = vi.fn((operations) => executeResumeOperations(operations, target));
    const buffer = createResumeOperationBuffer({
      apply,
      getRecordCount: (module) => data[module].data.length,
    });
    const tool = createProposeResumeEditsTool({
      getResumeData: () => ({
        user: { title: data.user.ui.title, data: structuredClone(data.user.data) },
        work: { title: data.work.ui.title, data: structuredClone(data.work.data) },
      }),
      applyResumeOperations: buffer.execute,
    });
    const operations = [
      {
        op: "updateModule",
        module: "user",
        field: "email",
        value: "test@example.com",
      },
      {
        op: "addRecord",
        module: "work",
        record: {
          name: "乙公司",
          post: "高级工程师",
          time: ["2025.02", "2026.08"],
          content: "<p>负责架构设计</p>",
        },
      },
    ];
    buffer.begin();

    const result = tool.execute({ operations });

    expect(result).toMatchObject({
      applied: true,
      changed: [0, 1],
      added: [{ module: "work", index: 1 }],
      errors: [],
    });
    expect(data.user.data.email).toBeUndefined();
    expect(data.work.data).toHaveLength(1);

    buffer.commit();
    expect(apply).toHaveBeenCalledTimes(1);
    expect(data.user.data.email).toBe("test@example.com");
    expect(data.work.data[1]).toMatchObject({
      name: "乙公司",
      post: "高级工程师",
      time: ["2025.02", "2026.08"],
      content: "<p>负责架构设计</p>",
    });
  });
});
