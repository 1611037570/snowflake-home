import { describe, expect, it } from "vitest";
import { findResumeModuleSchema, RESUME_SCHEMA } from "./resumeSchemaRegistry";

describe("resumeSchemaRegistry", () => {
  it("从真实表单配置生成对象模块字段", () => {
    const user = findResumeModuleSchema("user");
    const status = user?.fields.find((field) => field.key === "status");

    expect(user).toMatchObject({ title: "个人信息", kind: "object", dataPath: ["data"] });
    expect(status).toMatchObject({
      label: "状态",
      addable: true,
      options: ["在职", "离职", "应届生"],
    });
  });

  it("从真实数组容器生成记录字段", () => {
    const education = findResumeModuleSchema("education");

    expect(education).toMatchObject({ kind: "array", dataPath: ["data"] });
    expect(education?.fields.map((field) => field.key)).toEqual([
      "name",
      "education",
      "post",
      "mode",
      "time",
      "content",
    ]);
    expect(education?.fields.find((field) => field.key === "time")).toMatchObject({
      format: "monthRange",
      valueType: "array",
    });
  });

  it("为动态自定义模块复用唯一模板", () => {
    expect(findResumeModuleSchema("custom_a810d50c")).toMatchObject({
      key: "custom",
      kind: "custom",
      dataPath: ["data", "list"],
    });
    expect(RESUME_SCHEMA.filter((module) => module.key === "custom")).toHaveLength(1);
  });
});
