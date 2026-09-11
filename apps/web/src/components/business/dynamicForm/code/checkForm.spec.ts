import { describe, expect, it } from "vitest";
import { checkForm } from "./checkForm";

describe("checkForm", () => {
  it("数组字段校验 itemSchema", () => {
    expect(checkForm({ type: "array", itemSchema: { type: "group" } })).toBe(true);
    expect(checkForm({ type: "array" })).toBe("缺少 itemSchema");
  });
});
