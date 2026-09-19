import { describe, expect, it } from "vitest";
import { findResumeModuleSchema, RESUME_SCHEMA } from "./resumeSchemaRegistry";

describe("resumeSchemaRegistry", () => {
  it("从真实表单配置生成对象模块字段", () => {
    const user = findResumeModuleSchema("user");
    const status = user?.fields.find((field) => field.key === "status");

    expect(user).toMatchObject({ title: "个人信息", kind: "object", dataPath: ["data"] });
    expect(status).toMatchObject({
      label: "求职状态",
      addable: true,
      options: ["在职", "离职", "应届生", "随时到岗", "一月内到岗", "在职看机会"],
    });
  });

  it("从真实数组容器生成记录字段", () => {
    const education = findResumeModuleSchema("education");

    expect(education).toMatchObject({ kind: "array", dataPath: ["list"] });
    expect(education?.fields.map((field) => field.key)).toEqual([
      "name",
      "tags",
      "college",
      "education",
      "mode",
      "startTime",
      "endTime",
      "post",
      "city",
      "content",
    ]);
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
