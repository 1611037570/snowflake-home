import { describe, expect, it } from "vitest";
import { validateFragmentCoverage } from "./validateFragmentCoverage";
import { paginateFlow, type FlowPageItem } from "./paginateFlow";
import type { LayoutNode } from "../types";
import type { MeasuredNode } from "../measure/types";

const node: LayoutNode = {
  id: "node", // 测试节点编号
  sourceModuleKey: "generic", // 通用来源模块
  type: "richText", // 富文本节点
  payload: {}, // 测试载荷
};
const measured: MeasuredNode = {
  nodeId: node.id, // 对应节点编号
  width: 100, // 实测宽度
  fullHeight: 120, // 完整高度
  contentLength: 10, // 正文字符长度
  blockIndices: [0, 3], // 隐藏字段后的稳定块编号
  breakPoints: [
    { offset: 0, type: "block", height: 20, blockEnd: 1 }, // 第一块结束位置
    { offset: 5, type: "textRange", height: 70 }, // 正文中间断点
    { offset: 0, type: "block", height: 120, blockEnd: 4 }, // 最后的正文块
  ],
};
const item = (start: number, end: number, blockStart = 0): FlowPageItem => ({
  fragmentId: `node:${start}`, // 测试分片编号
  nodeId: node.id, // 来源节点
  sourceModuleKey: node.sourceModuleKey, // 来源模块
  fragment: "middle", // 续段分片
  height: 50, // 分片高度
  payload: {}, // 分片载荷
  contentRange: { start, end }, // 字符覆盖区间
  blockRange: { start: blockStart, end: 4 }, // 稳定块覆盖区间
});
const check = (items: FlowPageItem[]) => validateFragmentCoverage([node], new Map([[node.id, measured]]), items);

describe("通用分片完整性", () => {
  it("正文块在续页重复出现而字符连续时合法，隐藏空号不算缺失", () => {
    expect(check([item(0, 5), item(5, 10, 3)])).toEqual([]);
  });
  it("发现字符遗漏、重复与越界", () => {
    expect(check([item(0, 4), item(5, 10, 3)]).some((warning) => warning.code === "contentMissing")).toBe(true);
    expect(check([item(0, 6), item(5, 10, 3)]).some((warning) => warning.code === "contentOverlap")).toBe(true);
    expect(check([item(0, 11)]).some((warning) => warning.code === "contentOutOfBounds")).toBe(true);
  });
  it("发现头部块重复或遗漏以及整个节点未输出", () => {
    expect(check([item(0, 5), item(5, 10)]).some((warning) => warning.code === "contentOverlap")).toBe(true);
    expect(check([item(0, 10, 3)]).some((warning) => warning.code === "contentMissing")).toBe(true);
    expect(check([]).some((warning) => warning.code === "contentMissing")).toBe(true);
  });
  it("没有字符和内部块的不可分内容重复输出也会报告", () => {
    const plain: MeasuredNode = { ...measured, contentLength: 0 /* 无字符内容 */, blockIndices: [] /* 无内部块 */, breakPoints: [] /* 不可拆分 */ };
    const fragment = { ...item(0, 0), contentRange: undefined /* 不裁剪字符 */, blockRange: undefined /* 不裁剪块 */ };
    expect(validateFragmentCoverage([node], new Map([[node.id, plain]]), [fragment, fragment]).some((warning) => warning.code === "contentOverlap")).toBe(true);
  });
  it("真实分页输出及空页超高整片保持完整", () => {
    for (const height of [60, 10]) {
      const pages = paginateFlow({
        nodes: [node], // 通用节点
        measurements: new Map([[node.id, measured]]), // 当前测量结果
        heights: { firstPageHeight: height, laterPageHeight: height }, // 首页及后续页高度
        gap: 0, // 无额外模块间距
      });
      expect(check(pages.flatMap((page) => page.items))).toEqual([]);
    }
  });
});
