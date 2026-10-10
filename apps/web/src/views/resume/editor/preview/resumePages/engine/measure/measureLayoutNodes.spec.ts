import { describe, expect, it, vi } from "vitest";
import { measureLayoutNodes } from "./measureLayoutNodes";
import { paginateFlow } from "../paginate/paginateFlow";
import type { LayoutNode } from "../types";

describe("嵌套块分页测量", () => {
  it("装饰边框不计入块序，末尾留白与最后内容共同分页", () => {
    const root = document.createElement("div");
    root.innerHTML = '<div data-layout-node-id="item"><div data-layout-block-range>' +
      '<div>头部</div><div>岗位</div><div>标签</div><div>正文</div>' +
      '<div aria-hidden="true" style="position:absolute"></div></div>' +
      '<div data-layout-breakpoint-offset="2"></div></div>';
    const element = root.firstElementChild as HTMLElement;
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 100, 300, 120));
    const blocks = Array.from(element.querySelector("[data-layout-block-range]")!.children);
    blocks.forEach((block, index) => {
      vi.spyOn(block, "getBoundingClientRect").mockReturnValue(
        index === 4 ? new DOMRect(0, 100, 300, 120) : new DOMRect(0, 112 + index * 24, 300, 24),
      );
    });
    vi.spyOn(element.querySelector("[data-layout-breakpoint-offset]")!, "getBoundingClientRect")
      .mockReturnValue(new DOMRect(0, 100, 300, 108));
    const node: LayoutNode = {
      id: "item", // 条目节点编号
      sourceModuleKey: "test", // 所属模块编号
      type: "block", // 条目内容块
      payload: null, // 本用例不依赖业务载荷
      breakPoints: [{ offset: 2 /* 正文末尾 */, type: "paragraph" /* 段落断点 */ }],
    };
    const measurements = measureLayoutNodes(root, [node]);
    const points = measurements.get(node.id)!.breakPoints;
    expect(points.filter((point) => point.type === "block")).toHaveLength(4);
    expect(points.find((point) => point.blockEnd === 4)?.height).toBe(120);
    expect(points.find((point) => point.offset === 2)?.height).toBe(120);
    const pages = paginateFlow({
      nodes: [node], // 当前条目
      measurements, // 包含底部留白的真实尺寸
      heights: { firstPageHeight: 110 /* 首页剩余高度 */, laterPageHeight: 200 /* 续页可用高度 */ },
      gap: 0, // 无模块间距
    });
    expect(pages).toHaveLength(2);
    expect(pages[0].items[0].blockRange).toEqual({ start: 0, end: 3 });
    expect(pages[1].items[0].blockRange).toEqual({ start: 3, end: 4 });
  });

  it("嵌套单列字段提供稳定块断点，超高资料跨页且不重复头部", () => {
    const root = document.createElement("div");
    root.innerHTML = '<div data-layout-node-id="profile"><div data-layout-block-index="1"></div><section>' +
      Array.from({ length: 28 }, (_, index) => `<span data-layout-block-index="${index + 2}"></span>`).join("") +
      '</section></div>';
    const element = root.firstElementChild as HTMLElement;
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 100, 300, 1044));
    Array.from(element.querySelectorAll<HTMLElement>("[data-layout-block-index]")).forEach((block, index) => {
      vi.spyOn(block, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 100 + index * 36, 300, 36 - (index < 28 ? 12 : 0)));
    });
    const node: LayoutNode = {
      id: "profile", // 测量节点编号
      sourceModuleKey: "profile", // 来源模块编号
      type: "group", // 成组内容类型
      payload: {}, // 本用例无需业务载荷
    };
    const measurements = measureLayoutNodes(root, [node]);
    const points = measurements.get(node.id)!.breakPoints;
    expect(points).toHaveLength(29);
    // 隐藏头像不改变姓名和字段块序号，续段扣掉首字段前的网格间距。
    expect(points[0]).toMatchObject({ blockEnd: 2, height: 24, leadingMargin: 0 });
    expect(points[1]).toMatchObject({ blockEnd: 3, height: 60, leadingMargin: 12 });
    const pages = paginateFlow({
      nodes: [node], // 按顺序分页的内容节点
      measurements, // 嵌套块实际测量结果
      heights: { firstPageHeight: 1000 /* 首页可用高度 */, laterPageHeight: 1000 /* 后续页可用高度 */ },
      gap: 0, // 模块间距
    });
    expect(pages).toHaveLength(2);
    expect(pages.every((page) => page.usedHeight <= page.availableHeight!)).toBe(true);
    expect(pages[0]!.items[0]!.blockRange).toEqual({ start: 0, end: 29 });
    expect(pages[1]!.items[0]!.blockRange).toEqual({ start: 29, end: 30 });
    expect(pages[1]!.items[0]!.height).toBe(36);
  });
});
