import type { LayoutNode } from "../engine/types";

// user 模块保持独立渲染，标题节点自成一行，其余有内容的排版节点作为单条条目处理。
export const isItemNode = (node: LayoutNode) =>
  node.type !== "spacer" &&
  node.type !== "title" &&
  !(node.type === "group" && node.sourceModuleKey === "user");

// 时间轴只作用于经历类分组，其他模块继续使用普通条目宽度。
export const isTimelineNode = (node: LayoutNode, themeId: string) =>
  themeId === "timeline" && node.type === "group" && node.sourceModuleKey !== "user";

// 渲染与测量共用分片边框处理，避免分页前后的容器尺寸不一致。
export const getItemFragmentStyle = (
  blockRange: { start: number; end: number },
  contentRange: { start: number; end: number } | undefined,
  decoration: "full" | "top" | "middle" | "bottom",
  radius: string | number,
) => {
  const normalizedRadius = String(radius || "0");
  const boxTopRendered = blockRange.start > 0 || (contentRange?.start ?? 0) > 0;
  const boxBottomFinal = decoration !== "top" && decoration !== "middle";
  const topRadius = boxTopRendered ? "0" : normalizedRadius;
  const bottomRadius = boxBottomFinal ? normalizedRadius : "0";

  return {
    borderRadius: `${topRadius} ${topRadius} ${bottomRadius} ${bottomRadius}`,
    ...(boxTopRendered ? { paddingTop: "0px", borderTopWidth: "0px" } : {}),
    ...(!boxBottomFinal ? { paddingBottom: "0px", borderBottomWidth: "0px" } : {}),
  };
};
