import type { LayoutNode } from "../types";
import type { MeasuredNode } from "../measure/types";
import { validateContentBlockIndices } from "../contentBlocks";
import { getContentEnd, type FlowPageItem } from "./paginateFlow";
import type { LayoutWarning } from "./pagePlan";

/** 分片覆盖检查只比较通用区间，不读取业务字段或主题编号。 */
export const validateFragmentCoverage = (
  nodes: readonly LayoutNode[],
  measurements: ReadonlyMap<string, MeasuredNode>,
  fragments: readonly FlowPageItem[],
): LayoutWarning[] => {
  const warnings: LayoutWarning[] = [];
  const report = (nodeId: string, code: LayoutWarning["code"], detail: string) => {
    warnings.push({ nodeId /* 问题节点编号 */, code /* 问题类别 */, message: `节点 ${nodeId}：${detail}` /* 定位说明 */ });
  };
  const byNode = new Map<string, FlowPageItem[]>();
  for (const fragment of fragments) {
    const list = byNode.get(fragment.nodeId) ?? [];
    list.push(fragment);
    byNode.set(fragment.nodeId, list);
  }
  const nodeIds = new Set(nodes.map((node) => node.id));
  for (const nodeId of byNode.keys()) if (!nodeIds.has(nodeId)) report(nodeId, "contentOutOfBounds", "分片引用了不存在的节点");
  for (const node of nodes) {
    const measurement = measurements.get(node.id);
    if (!measurement) { report(node.id, "contentMissing", "缺少测量结果"); continue; }
    const items = byNode.get(node.id) ?? [];
    // 页首隐藏的间距节点允许不产生片段，不将排版占位当作业务内容。
    if (!items.length && node.hideWhenPageLeading) continue;
    if (!items.length) { report(node.id, "contentMissing", "没有输出内容分片"); continue; }
    const contentEnd = getContentEnd(measurement);
    if (measurement.breakPoints.some((point) => point.blockEnd !== undefined && (!Number.isSafeInteger(point.blockEnd) || point.blockEnd < 0))) {
      report(node.id, "contentOutOfBounds", "测量的块结束编号无效"); continue;
    }
    const blockCount = measurement.breakPoints.reduce((max, point) => Math.max(max, point.blockEnd ?? 0), 0);
    const indices = measurement.blockIndices ?? Array.from({ length: blockCount }, (_, index) => index);
    if (!Number.isSafeInteger(contentEnd) || contentEnd < 0 || !validateContentBlockIndices(indices)) {
      report(node.id, "contentOutOfBounds", "测量的字符长度或块编号无效"); continue;
    }
    if ((node.splitMode === "whole" || (contentEnd === 0 && indices.length === 0)) && items.length > 1) {
      report(node.id, "contentOverlap", "不可分内容重复输出");
    }
    let cursor = 0;
    const blockOwners = new Map<number, number>();
    for (const item of items) {
      const range = item.blockRange;
      if (range && (!Number.isSafeInteger(range.start) || !Number.isSafeInteger(range.end) || range.start < 0 || range.end < range.start || range.end > blockCount)) {
        report(node.id, "contentOutOfBounds", "块区间越界"); continue;
      }
      // 文本断点可反复覆盖最后的正文块，正文重复由字符轨道检查。
      for (const index of indices) {
        if (contentEnd > 0 && index === measurement.textBlockIndex) continue;
        if (!range || (index >= range.start && index < range.end)) blockOwners.set(index, (blockOwners.get(index) ?? 0) + 1);
      }
      const text = item.contentRange ?? (contentEnd > 0 && (!blockCount || !range || (measurement.textBlockIndex !== undefined && range.start <= measurement.textBlockIndex && range.end > measurement.textBlockIndex))
        ? { start: 0 /* 未裁剪正文起点 */, end: contentEnd /* 完整正文终点 */ } : undefined);
      if (!text) continue;
      if (!Number.isSafeInteger(text.start) || !Number.isSafeInteger(text.end) || text.start < 0 || text.end < text.start || text.end > contentEnd) {
        report(node.id, "contentOutOfBounds", "字符区间越界"); continue;
      }
      if (text.end === text.start) continue;
      if (text.start < cursor) report(node.id, "contentOverlap", "字符区间重复或逆序");
      if (text.start > cursor) report(node.id, "contentMissing", "字符区间中间有遗漏");
      cursor = Math.max(cursor, text.end);
    }
    if (cursor < contentEnd) report(node.id, "contentMissing", "正文末尾没有完整输出");
    for (const index of indices) {
      if (contentEnd > 0 && index === measurement.textBlockIndex) continue;
      const count = blockOwners.get(index) ?? 0;
      if (!count) report(node.id, "contentMissing", `内容块 ${index} 没有输出`);
      if (count > 1) report(node.id, "contentOverlap", `内容块 ${index} 重复输出`);
    }
  }
  return warnings;
};
