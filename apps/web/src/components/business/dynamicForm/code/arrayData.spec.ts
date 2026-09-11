import { describe, expect, it } from "vitest";
import type { FormField } from "../types";
import { addArrayRecord, getArrayRecords, moveArrayRecord, removeArrayRecord } from "./arrayData";

const createArrayField = (source: string[]): FormField => ({
  type: "array",
  source,
  itemSchema: {
    type: "group",
    model: {
      source: ["name"],
      prop: "name",
      defaultValue: "默认名称",
    },
  },
});

describe("arrayData", () => {
  it("读取普通模块的真实记录数组", () => {
    const data = { education: { data: [{ name: "本科" }] } };
    const field = createArrayField(["education", "data"]);

    expect(getArrayRecords(data, field)).toBe(data.education.data);
  });

  it("新增记录时创建缺失路径并写入默认数据", () => {
    const data: Record<string, any> = {};
    const field = createArrayField(["education", "data"]);

    expect(addArrayRecord(data, field)).toBe(0);
    expect(data).toEqual({ education: { data: [{ name: "默认名称" }] } });
  });

  it("支持自定义模块的嵌套记录路径", () => {
    const data = { custom_a1: { data: { list: [] as any[] } } };
    const field = createArrayField(["custom_a1", "data", "list"]);

    expect(addArrayRecord(data, field)).toBe(0);
    expect(data.custom_a1.data.list).toEqual([{ name: "默认名称" }]);
  });

  it("删除和移动只修改真实记录数组", () => {
    const data = {
      work: { data: [{ name: "甲" }, { name: "乙" }, { name: "丙" }] },
    };
    const field = createArrayField(["work", "data"]);

    expect(moveArrayRecord(data, field, 2, 0)).toBe(true);
    expect(data.work.data.map((item) => item.name)).toEqual(["丙", "甲", "乙"]);
    expect(removeArrayRecord(data, field, 1)).toBe(true);
    expect(data.work.data.map((item) => item.name)).toEqual(["丙", "乙"]);
  });

  it("无效路径和下标不会修改数据", () => {
    const data = { work: { data: [{ name: "甲" }] } };
    const field = createArrayField(["work", "data"]);
    const invalidField: FormField = { type: "array", itemSchema: { type: "group" } };

    expect(addArrayRecord(data, invalidField)).toBe(-1);
    expect(removeArrayRecord(data, field, -1)).toBe(false);
    expect(moveArrayRecord(data, field, 0, 1)).toBe(false);
    expect(data.work.data).toEqual([{ name: "甲" }]);
  });
});
