import { describe, expect, it } from "vitest";
import type { FormField } from "../types";
import { isFieldHidden, isFieldRemoved } from "./fieldVisible";

describe("fieldVisible", () => {
  it("按数组记录上下文解析相对显隐规则", () => {
    const data = {
      work: {
        data: [{ hidden: true, archived: false }],
      },
    };
    const context = { basePath: ["work", "data"], index: 0 };
    const field: FormField = {
      checks: {
        removed: { path: ["hidden"] },
        hidden: { path: ["archived"], equals: false },
      },
    };

    expect(isFieldRemoved(data, field, context)).toBe(true);
    expect(isFieldHidden(data, field, context)).toBe(true);
  });
});
