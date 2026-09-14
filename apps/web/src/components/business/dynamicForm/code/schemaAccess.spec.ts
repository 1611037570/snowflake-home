import { describe, expect, it, vi } from "vitest";
import type { FormField } from "../types";
import {
  getArrayDataPath,
  getModelBindings,
  getPrimaryModelBinding,
  walkFormFields,
} from "./schemaAccess";

describe("schemaAccess", () => {
  it("统一返回单绑定与多绑定", () => {
    const single: FormField = {
      type: "object",
      component: "input",
      model: { source: ["user", "data", "name"], prop: "modelValue" },
    };
    const multiple: FormField = {
      type: "object",
      component: "select",
      model: [
        { source: ["user", "data", "sex"], prop: "modelValue" },
        { source: ["__options", "sex"], prop: "list", raw: true },
      ],
    };

    expect(getModelBindings(single)).toHaveLength(1);
    expect(getModelBindings(multiple)).toHaveLength(2);
    expect(getModelBindings({} as FormField)).toEqual([]);
  });

  it("优先取得组件主值绑定并排除外部字典", () => {
    const field: FormField = {
      type: "object",
      component: "select",
      model: [
        { source: ["user", "data", "label"], prop: "label" },
        { source: ["__options", "status"], prop: "list", raw: true },
        { source: ["user", "data", "status"], prop: "modelValue" },
      ],
    };

    expect(getPrimaryModelBinding(field)?.source).toEqual(["user", "data", "status"]);
    expect(
      getPrimaryModelBinding({
        type: "object",
        component: "input",
        model: { source: ["user", "data", "name"], prop: "name" },
      })?.source,
    ).toEqual(["user", "data", "name"]);
    expect(
      getPrimaryModelBinding({
        type: "object",
        component: "select",
        model: { source: ["__options", "status"], prop: "list", raw: true },
      }),
    ).toBeUndefined();
  });

  it("按声明顺序遍历普通子字段与数组子项结构", () => {
    const visitor = vi.fn();
    const schema: FormField = {
      type: "group",
      fields: [
        {
          type: "object",
          component: "input",
          label: "固定字段",
          model: { source: ["fixed"], prop: "modelValue" },
        },
        {
          type: "array",
          source: ["items"],
          itemSchema: {
            type: "group",
            fields: [
              {
                type: "object",
                component: "input",
                label: "数组字段",
                model: { source: ["name"], prop: "modelValue" },
              },
            ],
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

  it("读取数组容器显式声明的数据源", () => {
    const schema: FormField = {
      type: "array",
      source: ["education", "data"],
      itemSchema: {
        type: "object",
        component: "input",
        model: {
          source: ["name"],
          prop: "modelValue",
        },
      },
    };

    expect(getArrayDataPath(schema)).toEqual(["education", "data"]);
    expect(getArrayDataPath({ type: "array" } as FormField)).toBeUndefined();
  });
});
