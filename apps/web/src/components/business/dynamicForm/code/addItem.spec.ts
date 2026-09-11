import { describe, expect, it } from "vitest";
import type { FormField } from "../types";
import { createAddItem } from "./addItem";

const arrayField: FormField = {
  type: "array",
  itemSchema: {
    type: "group",
    model: {
      source: ["education", "data", "?", "name"],
      prop: "name",
      defaultValue: "默认名称",
    },
  },
};

describe("createAddItem", () => {
  it("数组容器直接向真实数据新增记录", () => {
    const data = { education: { data: [] as any[] } };
    const addItem = createAddItem(arrayField, { data });

    expect(addItem()).toBe(0);
    expect(data.education.data).toEqual([{ name: "默认名称" }]);
  });

  it("分组容器向内部数组字段新增记录", () => {
    const data = { education: { data: [] as any[] } };
    const group: FormField = { type: "group", fields: [arrayField] };
    const addItem = createAddItem({ value: group }, { data });

    expect(addItem()).toBe(0);
    expect(data.education.data).toEqual([{ name: "默认名称" }]);
  });
});
