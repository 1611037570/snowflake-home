import { describe, expect, it } from "vitest";
import { findResumeModuleSchema, RESUME_SCHEMA } from "@snowflake/resume-agent";
import { registerResumeAgentSchema } from "./resumeSchemaProvider";

// 测试直接运行时显式装配 Web 表单字段契约。
registerResumeAgentSchema();

describe("resumeSchemaRegistry", () => {
  it("从真实表单配置生成对象模块字段", () => {
    const user = findResumeModuleSchema("user");
    const status = user?.fields.find((field) => field.key === "status");

    expect(user).toMatchObject({ title: "个人信息", kind: "object", dataPath: ["data"] });
    expect(status).toMatchObject({
      label: "求职状态",
      addable: true,
      options: ["在职", "离职", "应届生", "在职看机会"],
    });
  });

  it("从真实数组容器生成记录字段", () => {
    const education = findResumeModuleSchema("education");

    expect(education).toMatchObject({ kind: "array", dataPath: ["list"] });
    // 字段清单随表单配置自动同步，只锁定稳定字段，避免表单增删字段后断言过期
    const keys = education?.fields.map((field) => field.key) ?? [];
    expect(keys).toEqual(
      expect.arrayContaining(["name", "education", "startTime", "endTime", "content", "college"]),
    );
    expect(education?.fields.find((field) => field.key === "endTime")).toMatchObject({
      format: "month",
      valueType: "string",
    });
  });

  it("为动态自定义模块复用唯一模板", () => {
    expect(findResumeModuleSchema("custom_a810d50c")).toMatchObject({
      key: "custom",
      kind: "custom",
      dataPath: ["list"],
    });
    expect(RESUME_SCHEMA.filter((module) => module.key === "custom")).toHaveLength(1);
  });
});
