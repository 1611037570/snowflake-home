import { describe, expect, it } from "vitest";
import type { FormField } from "../types";
import { addFieldData, getFieldDataKey, hasFieldData } from "./fieldData";

const emailField: FormField = {
  type: "object",
  component: "input",
  addable: true,
  model: {
    source: ["user", "data", "email"],
    prop: "modelValue",
  },
};

describe("fieldData", () => {
  it("使用主数据路径生成稳定标识", () => {
    expect(getFieldDataKey(emailField)).toBe("user.data.email");
    expect(getFieldDataKey({})).toBeUndefined();
  });

  it("按属性存在性判断字段是否已添加", () => {
    const data = { user: { data: { email: "" } } };

    expect(hasFieldData(data, emailField)).toBe(true);
    expect(hasFieldData({ user: { data: {} } }, emailField)).toBe(false);
  });

  it("按主数据路径创建统一默认值", () => {
    const data = {};

    expect(addFieldData(data, emailField)).toBe(true);
    expect(data).toEqual({ user: { data: { email: "" } } });
    expect(addFieldData(data, emailField)).toBe(false);
  });

  it("为引用类型默认值创建独立副本", () => {
    const field: FormField = {
      model: {
        source: ["user", "data", "tags"],
        prop: "modelValue",
        defaultValue: [],
      },
    };
    const first = {};
    const second = {};

    addFieldData(first, field);
    addFieldData(second, field);

    expect((first as any).user.data.tags).toEqual([]);
    expect((first as any).user.data.tags).not.toBe((second as any).user.data.tags);
  });

  it("支持解析数组记录索引", () => {
    const field: FormField = {
      model: {
        source: ["work", "data", "?", "summary"],
        prop: "modelValue",
        defaultValue: "待填写",
      },
    };
    const data = { work: { data: [{}] } };

    expect(addFieldData(data, field, 0)).toBe(true);
    expect(hasFieldData(data, field, 0)).toBe(true);
    expect(data.work.data[0]).toEqual({ summary: "待填写" });
    expect(hasFieldData(data, field)).toBe(false);
  });

  it("遇到无效路径时不覆盖已有数据", () => {
    const data = { user: "已有内容" };

    expect(addFieldData(data, emailField)).toBe(false);
    expect(data.user).toBe("已有内容");
  });
});
