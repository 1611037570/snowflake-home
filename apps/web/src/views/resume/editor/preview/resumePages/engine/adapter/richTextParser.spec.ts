import { describe, expect, it } from "vitest";
import { parseRichText } from "./richTextParser";

describe("parseRichText", () => {
  it("长单段富文本会生成字符级兜底断点", () => {
    const result = parseRichText(`<p>${"长文本".repeat(600)}</p>`);

    expect(result.breakPoints.some((point) => point.type === "char")).toBe(true);
    expect(result.breakPoints.at(-1)?.offset).toBe(result.textLength);
  });
});
