import type { PagePlanStatus } from "../engine/paginate/pagePlan";

/** 输出布局：分页使用有效页面计划，连续长图只要求测量完成。 */
export type ExportLayoutMode = "pages" | "continuous";

// 所有导出入口共用布局判定，资源完成后仍须确认最新测量。
export const getExportLayoutStatus = (
  measured: boolean,
  pageStatus: PagePlanStatus | undefined,
  mode: ExportLayoutMode,
): PagePlanStatus | "pending" => {
  if (mode === "pages" && pageStatus === "invalid") return "invalid";
  if (!measured) return "pending";
  return mode === "continuous" ? "ready" : pageStatus || "pending";
};
