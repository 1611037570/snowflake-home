import { describe, expect, it, vi } from "vitest";
import type { FormField } from "../types";
import { getArrayDataPath, getModelBindings, walkFormFields } from "./schemaAccess";

describe("schemaAccess", () => {
  it("统一返回单绑定与多绑定", () => {
    const single: FormField = {
      model: { source: ["user", "data", "name"], prop: "modelValue" },
    };
    const multiple: FormField = {
      model: [
        { source: ["user", "data", "sex"], prop: "modelValue" },
        { source: ["__options", "sex"], prop: "list", raw: true },
      ],
    };

    expect(getModelBindings(single)).toHaveLength(1);
    expect(getModelBindings(multiple)).toHaveLength(2);
    expect(getModelBindings({})).toEqual([]);
  });

  it("按声明顺序遍历普通子字段与数组子项结构", () => {
    const visitor = vi.fn();
    const schema: FormField = {
      type: "group",
      fields: [
        { type: "object", component: "input", label: "固定字段" },
        {
          type: "array",
          itemSchema: {
            type: "group",
            fields: [{ type: "object", component: "input", label: "数组字段" }],
          },
        },
      ],
    };

    walkFormFields(schema, visitor);

    expect(visitor.mock.calls.map(([field]) => field.label || field.type)).toEqual([
      "group",
      "固定字段",
      "array",
      "group",
      "数组字段",
    ]);
  });

  it("从有效数据绑定中解析数组路径", () => {
    const schema: FormField = {
      type: "array",
      itemSchema: {
        type: "group",
        model: [
          { source: ["__options", "education", "?"], prop: "list", raw: true },
          {
            source: ["education", "data", "?", "collapsed"],
            prop: "collapsed",
          },
        ],
      },
    };

    expect(getArrayDataPath(schema)).toEqual(["education", "data"]);
  });
});
