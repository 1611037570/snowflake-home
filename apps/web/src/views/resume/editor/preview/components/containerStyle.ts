import type { LayoutNode } from "../resumePages/engine/types";

// 保持容器样式只作用于原本使用内容容器的节点类型。
export const hasContainerStyle = (node: LayoutNode) =>
  node.type === "richText" ||
  (node.type === "group" && node.sourceModuleKey !== "user") ||
  node.type === "media";

// 渲染与测量共用分片边框处理，避免分页前后的容器尺寸不一致。
export const getContainerFragmentStyle = (
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
