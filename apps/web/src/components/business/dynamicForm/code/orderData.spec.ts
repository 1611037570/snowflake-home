import { describe, expect, it } from "vitest";
import { applyVisibleOrder, keepFixedFirst } from "./orderData";

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
