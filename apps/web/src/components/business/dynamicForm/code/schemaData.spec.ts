import { reactive } from "vue";
import { describe, expect, it, vi } from "vitest";
import type { FormField } from "../types";
import { createArrayItemData, resolveDefaultValue } from "./schemaData";

describe("schemaData", () => {
  it("统一解析基础默认值", () => {
    expect(resolveDefaultValue(undefined)).toBe("");
    expect(resolveDefaultValue(null)).toBe("");
    expect(resolveDefaultValue(false)).toBe(false);
    expect(resolveDefaultValue(0)).toBe(0);
    expect(resolveDefaultValue(50)).toBe(50);
  });

  it("执行函数默认值并克隆引用类型", () => {
    const factory = vi.fn(() => ["1"]);
    const first = resolveDefaultValue(factory);
    const second = resolveDefaultValue(factory);

    expect(factory).toHaveBeenCalledTimes(2);
    expect(first).toEqual(["1"]);
    expect(second).toEqual(["1"]);
    expect(first).not.toBe(second);
  });

  it("解包并克隆响应式默认值", () => {
    const defaultValue = reactive(["1"]);
    const result = resolveDefaultValue(defaultValue);

    expect(result).toEqual(["1"]);
    expect(result).not.toBe(defaultValue);
  });

  it("根据数组子项结构生成完整数据", () => {
    const schema: FormField = {
      type: "array",
      itemSchema: {
        type: "group",
        model: [
          {
            source: ["image", "data", "?", "collapsed"],
            prop: "collapsed",
            defaultValue: () => ["1"],
          },
          { source: ["image", "data", "?", "name"], prop: "name" },
        ],
        fields: [
          {
            type: "object",
            component: "image",
            model: [
              {
                source: ["image", "data", "?", "name"],
                prop: "name",
                defaultValue: "默认名称",
              },
              {
                source: ["image", "data", "?", "profile", "size"],
                prop: "size",
                defaultValue: 50,
              },
              { source: ["__options", "imageSize"], prop: "list", raw: true },
            ],
          },
        ],
      },
    };

    expect(createArrayItemData(schema)).toEqual({
      collapsed: ["1"],
      name: "默认名称",
      profile: { size: 50 },
    });
  });

  it("每次生成的数据不共享默认值引用", () => {
    const schema: FormField = {
      type: "array",
      itemSchema: {
        type: "group",
        model: {
          source: ["education", "data", "?", "collapsed"],
          prop: "collapsed",
          defaultValue: ["1"],
        },
      },
    };

    const first = createArrayItemData(schema);
    const second = createArrayItemData(schema);

    expect(first).toEqual(second);
    expect(first.collapsed).not.toBe(second.collapsed);
  });
});
