import { describe, expect, it } from "vitest";
import type { FormField } from "../types";
import { isFieldMuted, isFieldVisible } from "./fieldVisible";

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
        visible: { path: ["hidden"] },
        muted: { path: ["archived"], equals: false },
      },
    };

    expect(isFieldVisible(data, field, context)).toBe(true);
    expect(isFieldMuted(data, field, context)).toBe(true);
  });
});
