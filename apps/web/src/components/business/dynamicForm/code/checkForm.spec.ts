import { describe, expect, it } from "vitest";
import { checkForm } from "./checkForm";

describe("checkForm", () => {
  it("对象字段校验 component 和 model", () => {
    expect(checkForm({ type: "object", component: "input", model: { source: ["name"] } })).toBe(
      true,
    );
    expect(checkForm({ type: "object", fields: [{}] })).toBe("缺少 component、model");
  });

  it("分组字段校验 fields", () => {
    expect(checkForm({ type: "group", fields: [{ type: "object" }] })).toBe(true);
    expect(checkForm({ type: "group", fields: [] })).toBe("缺少 fields");
  });

  it("数组字段校验 itemSchema", () => {
    expect(checkForm({ type: "array", itemSchema: { type: "group" } })).toBe(true);
    expect(checkForm({ type: "array" })).toBe("缺少 itemSchema");
  });

  it("拒绝缺失类型和未知类型", () => {
    expect(checkForm({ fields: [{}] })).toBe("缺少 type");
    expect(checkForm({ type: "unknown" })).toBe("未知的 type: unknown");
  });
});
