import { describe, expect, it } from "vitest";
import {
  resolveBlockMargin,
  resolveCutHeight,
  resolveDroppedTopSpacing,
  resolveNextBlockMargin,
} from "./fragmentGeometry";
import type { BreakPointMeasure, MeasuredNode } from "../measure/types";

/** 构造块断点 */
const createBlockPoint = (
  blockEnd: number,
  height: number,
  leadingMargin?: number,
): BreakPointMeasure => ({ offset: 0, type: "block", height, blockEnd, leadingMargin });

/** 构造文本断点 */
const createTextPoint = (offset: number, height: number): BreakPointMeasure => ({
  offset,
  type: "textRange",
  height,
});

/** 构造节点测量结果 */
const createMeasurement = (
  breakPoints: BreakPointMeasure[],
  droppedTopSpacing?: number,
): MeasuredNode => ({
  nodeId: "node",
  width: 300,
  fullHeight: 200,
  minHeight: 0,
  breakPoints,
  droppedTopSpacing,
});

describe("resolveBlockMargin", () => {
  it("块断点读取自身外边距，文本断点没有外边距", () => {
    expect(resolveBlockMargin(createBlockPoint(1, 40, 12))).toBe(12);
    expect(resolveBlockMargin(createBlockPoint(1, 40))).toBe(0);
    expect(resolveBlockMargin(createTextPoint(5, 40))).toBe(0);
  });
});

describe("resolveCutHeight", () => {
  it("首片只扣除已消费高度", () => {
    expect(
      resolveCutHeight({
        point: createBlockPoint(1, 60, 12),
        startHeight: 20,
        isFirstFragment: true,
        droppedTopSpacing: 8,
      }),
    ).toBe(40);
  });

  it("续段同时扣除块上外边距与顶部内边距", () => {
    expect(
      resolveCutHeight({
        point: createBlockPoint(1, 60, 12),
        startHeight: 20,
        isFirstFragment: false,
        droppedTopSpacing: 8,
      }),
    ).toBe(20);
  });

  it("已消费高度为零时续段不扣顶部内边距", () => {
    // 与分页层改动前的口径一致：顶部留白只在内容盒已经开始（已消费高度大于零）时扣除
    expect(
      resolveCutHeight({
        point: createBlockPoint(1, 60, 12),
        startHeight: 0,
        isFirstFragment: false,
        droppedTopSpacing: 8,
      }),
    ).toBe(48);
  });

  it("排序与分片高度共用同一口径：首片与续段的差值等于被扣除的留白", () => {
    const point = createBlockPoint(1, 60, 12);
    const asFirst = resolveCutHeight({
      point,
      startHeight: 20,
      isFirstFragment: true,
      droppedTopSpacing: 8,
    });
    const asContinuation = resolveCutHeight({
      point,
      startHeight: 20,
      isFirstFragment: false,
      droppedTopSpacing: 8,
    });
    expect(asFirst - asContinuation).toBe(20);
  });
});

describe("resolveDroppedTopSpacing", () => {
  const measurement = createMeasurement([createBlockPoint(1, 60)], 8);

  it("只有续段落在页首且内容盒已开始时才扣除", () => {
    expect(
      resolveDroppedTopSpacing({
        measurement,
        isFirstFragment: false,
        atPageStart: true,
        hasRenderedContent: true,
      }),
    ).toBe(8);
  });

  it("首片、非页首、内容盒未开始三种情况都不扣除", () => {
    expect(
      resolveDroppedTopSpacing({
        measurement,
        isFirstFragment: true,
        atPageStart: true,
        hasRenderedContent: true,
      }),
    ).toBe(0);
    expect(
      resolveDroppedTopSpacing({
        measurement,
        isFirstFragment: false,
        atPageStart: false,
        hasRenderedContent: true,
      }),
    ).toBe(0);
    expect(
      resolveDroppedTopSpacing({
        measurement,
        isFirstFragment: false,
        atPageStart: true,
        hasRenderedContent: false,
      }),
    ).toBe(0);
  });

  it("测量结果没有顶部内边距时返回零", () => {
    expect(
      resolveDroppedTopSpacing({
        measurement: createMeasurement([createBlockPoint(1, 60)]),
        isFirstFragment: false,
        atPageStart: true,
        hasRenderedContent: true,
      }),
    ).toBe(0);
  });
});

describe("resolveNextBlockMargin", () => {
  const measurement = createMeasurement([
    createBlockPoint(1, 40, 6),
    createBlockPoint(2, 90, 14),
    createTextPoint(10, 120),
  ]);

  it("取当前游标之后第一个未消费块的外边距", () => {
    expect(resolveNextBlockMargin(measurement, 0)).toBe(6);
    expect(resolveNextBlockMargin(measurement, 40)).toBe(14);
  });

  it("没有后续块时返回零", () => {
    expect(resolveNextBlockMargin(measurement, 120)).toBe(0);
  });
});
