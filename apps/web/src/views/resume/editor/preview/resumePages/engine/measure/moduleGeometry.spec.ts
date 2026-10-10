import { describe, expect, it } from "vitest";
import { isNeutralModuleGeometry } from "./moduleGeometry";

describe("模块外框几何边界", () => {
  it("装饰不占尺寸时允许共享模块外框", () => {
    expect(isNeutralModuleGeometry({ width: 100 /* 外框宽度 */, height: 60 /* 外框高度 */, nodes: [
      { width: 100 /* 节点宽度 */, height: 20 /* 标题高度 */ },
      { width: 100 /* 节点宽度 */, height: 40 /* 正文高度 */ },
    ] })).toBe(true);
  });
  it("拒绝节点预算之外的纵向留白与横向内缩", () => {
    expect(isNeutralModuleGeometry({ width: 100 /* 外框宽度 */, height: 72 /* 额外留白 */, nodes: [{ width: 100 /* 节点宽度 */, height: 60 /* 节点高度 */ }] })).toBe(false);
    expect(isNeutralModuleGeometry({ width: 100 /* 外框宽度 */, height: 60 /* 外框高度 */, nodes: [{ width: 76 /* 私自内缩 */, height: 60 /* 节点高度 */ }] })).toBe(false);
  });
});
