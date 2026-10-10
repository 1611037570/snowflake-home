import { describe, expect, it } from "vitest";
import { createContentBlocks, isContentBlockVisible, validateContentBlockIndices } from "./contentBlocks";

describe("公共内容块", () => {
  it("可选行移除后按实际顺序编号", () => {
    const blocks = createContentBlocks(["title", "tags", "body"]);
    expect(blocks.indexOf("tags")).toBe(1);
    expect(blocks.indexOf("authors")).toBe(-1);
    expect(blocks.indexOf("body")).toBe(2);
  });
  it("允许隐藏字段留空号，拒绝重复、逆序和非法编号", () => {
    expect(validateContentBlockIndices([0, 3, 7])).toBe(true);
    for (const indices of [[0, 0], [3, 1], [-1], [1.5], [NaN]]) expect(validateContentBlockIndices(indices)).toBe(false);
    expect(() => createContentBlocks(["title", "title"])).toThrow("重复");
  });
  it("不存在的块不能显示，裁剪结束位置不包含在内", () => {
    expect(isContentBlockVisible(-1)).toBe(false);
    expect(isContentBlockVisible(3, { start: 3 /* 起始块 */, end: 7 /* 结束块 */ })).toBe(true);
    expect(isContentBlockVisible(7, { start: 3 /* 起始块 */, end: 7 /* 结束块 */ })).toBe(false);
  });
});
