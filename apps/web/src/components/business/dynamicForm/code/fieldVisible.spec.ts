import { describe, expect, it } from "vitest";
import type { FormField } from "../types";
import { isFieldHidden, isFieldRemoved, setFieldCheckValue } from "./fieldVisible";

describe("fieldVisible", () => {
  it("按分组上下文解析模块级显隐规则", () => {
    const field: FormField = {
      type: "group",
      context: ["user"],
      checks: { hidden: { path: ["ui", "hidden"] } },
      fields: [],
    };

    expect(isFieldHidden({ user: { ui: { hidden: true } } }, field)).toBe(true);
  });

  it("按数组记录上下文解析相对显隐规则", () => {
    const data = {
      work: {
        data: [{ hidden: true, archived: false }],
      },
    };
    const context = { basePath: ["work", "data"], index: 0 };
    const field: FormField = {
      type: "object",
      component: "input",
      model: { source: ["name"], prop: "modelValue" },
      checks: {
        removed: { path: ["hidden"] },
        hidden: { path: ["archived"], equals: false },
      },
    };

    expect(isFieldRemoved(data, field, context)).toBe(true);
    expect(isFieldHidden(data, field, context)).toBe(true);
  });

  it("按分组上下文写入模块级控制值", () => {
    const data = { user: { ui: { hidden: false } } };
    const field: FormField = {
      type: "group",
      context: ["user"],
      checks: { hidden: { path: ["ui", "hidden"] } },
      fields: [],
    };

    setFieldCheckValue(data, field, "hidden", true);

    expect(data.user.ui.hidden).toBe(true);
  });

  it("未声明检查规则时不写入数据", () => {
    const data = { work: {} as Record<string, any> };
    const field: FormField = {
      type: "object",
      component: "input",
      model: { source: ["name"], prop: "modelValue" },
    };

    setFieldCheckValue(data, field, "removed", true);

    expect(data.work).toEqual({});
  });
});
