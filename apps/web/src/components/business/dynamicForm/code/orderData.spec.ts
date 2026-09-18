import { describe, expect, it } from "vitest";
import type { FormField } from "../types";
import { applyVisibleOrder, keepFixedFirst, moveFieldByKey, moveFieldToContainer } from "./orderData";

describe("orderData", () => {
  it("按可见顺序回填完整列表，未渲染项保留原槽位", () => {
    const list = ["甲", "乙", "丙", "丁"];
    const visible = ["丙", "甲", "丁"];

    applyVisibleOrder(list, visible, (item) => item !== "乙");

    expect(list).toEqual(["丙", "乙", "甲", "丁"]);
  });

  it("可见项少于列表项时不改变多余项", () => {
    const list = ["甲", "乙", "丙"];
    const visible = ["丙"];

    applyVisibleOrder(list, visible, (item) => item === "丙");

    expect(list).toEqual(["甲", "乙", "丙"]);
  });

  it("固定项按原相对顺序排在最前", () => {
    const list = [
      { fixed: false, name: "甲" },
      { fixed: true, name: "乙" },
      { fixed: false, name: "丙" },
      { fixed: true, name: "丁" },
    ];

    keepFixedFirst(list, (item) => item.fixed);

    expect(list.map((item) => item.name)).toEqual(["乙", "丁", "甲", "丙"]);
  });

  it("无固定项时保持原顺序", () => {
    const list = ["甲", "乙"];

    keepFixedFirst(list, () => false);

    expect(list).toEqual(["甲", "乙"]);
  });
});

// 生成仅含 key 与固定标记的模块列表
const createFields = (keys: string[], fixedKeys: string[] = []): FormField[] =>
  keys.map(
    (key) =>
      ({
        type: "group",
        key,
        fields: [],
        fixed: fixedKeys.includes(key),
      }) as unknown as FormField,
  );
const keysOf = (fields: FormField[]) => fields.map((field) => field.key);

describe("moveFieldByKey", () => {
  it("把后面的模块移到目标模块之前", () => {
    const fields = createFields(["甲", "乙", "丙", "丁"]);

    expect(moveFieldByKey(fields, "丁", "乙", "before")).toBe(true);
    expect(keysOf(fields)).toEqual(["甲", "丁", "乙", "丙"]);
  });

  it("把前面的模块移到目标模块之后", () => {
    const fields = createFields(["甲", "乙", "丙", "丁"]);

    expect(moveFieldByKey(fields, "甲", "丙", "after")).toBe(true);
    expect(keysOf(fields)).toEqual(["乙", "丙", "甲", "丁"]);
  });

  it("缺省落到目标模块之前", () => {
    const fields = createFields(["甲", "乙", "丙"]);

    expect(moveFieldByKey(fields, "丙", "乙")).toBe(true);
    expect(keysOf(fields)).toEqual(["甲", "丙", "乙"]);
  });

  it("键相同、缺失或不存在时不修改列表", () => {
    const fields = createFields(["甲", "乙"]);

    expect(moveFieldByKey(fields, "甲", "甲")).toBe(false);
    expect(moveFieldByKey(fields, "甲", "丙")).toBe(false);
    expect(moveFieldByKey(fields, "", "乙")).toBe(false);
    expect(keysOf(fields)).toEqual(["甲", "乙"]);
  });

  it("固定模块不参与移动，也不允许插到固定模块之前", () => {
    const fields = createFields(["甲", "乙", "丙"], ["甲"]);

    expect(moveFieldByKey(fields, "甲", "丙", "after")).toBe(false);
    expect(moveFieldByKey(fields, "丙", "甲", "before")).toBe(false);
    expect(keysOf(fields)).toEqual(["甲", "乙", "丙"]);
  });

  it("允许移动到固定模块之后", () => {
    const fields = createFields(["甲", "乙", "丙"], ["甲"]);

    expect(moveFieldByKey(fields, "丙", "甲", "after")).toBe(true);
    expect(keysOf(fields)).toEqual(["甲", "丙", "乙"]);
  });
});

describe("moveFieldToContainer", () => {
  it("把字段从来源容器移到目标容器末尾", () => {
    const from = { fields: createFields(["甲", "乙"]) };
    const to = { fields: createFields(["丙"]) };

    expect(moveFieldToContainer(from, to, "甲")).toBe(true);
    expect(keysOf(from.fields)).toEqual(["乙"]);
    expect(keysOf(to.fields)).toEqual(["丙", "甲"]);
  });

  it("字段不存在或两个容器相同时不做修改", () => {
    const from = { fields: createFields(["甲"]) };
    const to = { fields: createFields(["乙"]) };

    expect(moveFieldToContainer(from, to, "丙")).toBe(false);
    expect(moveFieldToContainer(from, from, "甲")).toBe(false);
    expect(keysOf(from.fields)).toEqual(["甲"]);
    expect(keysOf(to.fields)).toEqual(["乙"]);
  });
});
