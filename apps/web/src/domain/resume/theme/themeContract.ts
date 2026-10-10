import type { RegionSlotId } from "@/domain/resume/theme/regionSlots";
import { isPageLayoutTemplateId } from "@/domain/resume/theme/layouts";
import type { ThemeDecisions } from "@/domain/resume/theme/themeDecisions";

/** 主题装饰内部空间，单位像素，不包含页面边距和模块间距。 */
export interface ThemeInset {
  top: number; // 上侧装饰内边距
  right: number; // 右侧装饰内边距
  bottom: number; // 下侧装饰内边距
  left: number; // 左侧装饰内边距
}

export interface ThemeColumnInset {
  left: number; // 栏内容距左侧装饰的距离
  right: number; // 栏内容距右侧装饰的距离
}

export interface ThemeRegionContract {
  inset?: ThemeInset; // 区域装饰内部空间
  columns?: Partial<Record<"left" | "right", ThemeColumnInset>>; // 按语义栏位声明内部空间
  fillsPageTop?: boolean; // 区域背景是否覆盖纸张顶边，内容仍遵守页面边距
}

export type ThemeRestrictions = Partial<Record<
  "user.avatarPosition" | "user.infoLayout" | "page.background" | "content.datePosition", // 可被主题固定的用户设置
  string // 设置限制的文案编号
>>;

export interface ThemeContentContract {
  renderer: string; // 个人信息内容组件编号
  split: "whole" | "blocks"; // 整块放置或按稳定内容块分片
}

/** 固定能力集中声明，外观组件不得重新决定公共尺寸。 */
export interface ThemeCapabilities {
  regions?: Partial<Record<RegionSlotId, ThemeRegionContract>>; // 区域与栏装饰尺寸
  userContent?: ThemeContentContract; // 个人信息内容及分片能力
  usesDateRail?: boolean; // 经历条目是否使用固定日期栏
  restrictions?: ThemeRestrictions; // 用户设置限制
  topDecoration?: string; // 首页顶部独立装饰组件编号，高度由真实测量得到
}

export const EMPTY_THEME_INSET: ThemeInset = {
  top: 0, // 无上侧装饰留白
  right: 0, // 无右侧装饰留白
  bottom: 0, // 无下侧装饰留白
  left: 0, // 无左侧装饰留白
};

/** 固定声明先校验后接入，不通过默认值静默掩盖非法几何。 */
export const validateThemeCapabilities = (capabilities: ThemeCapabilities): string[] => {
  const errors: string[] = [];
  const isObject = (value: unknown): boolean => typeof value === "object" && value !== null && !Array.isArray(value);
  const check = (value: unknown, field: string) => {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) errors.push(field);
  };
  if (capabilities.regions !== undefined && !isObject(capabilities.regions)) errors.push("regions");
  for (const [slot, region] of Object.entries(isObject(capabilities.regions) ? capabilities.regions! : {})) {
    if (!["slogan", "user", "main"].includes(slot)) errors.push(`regions.${slot}`);
    if (!isObject(region)) { errors.push(`regions.${slot}`); continue; }
    if (region.fillsPageTop !== undefined && typeof region.fillsPageTop !== "boolean") errors.push(`regions.${slot}.fillsPageTop`);
    if (region.inset !== undefined && !isObject(region.inset)) errors.push(`regions.${slot}.inset`);
    if (isObject(region.inset)) for (const side of ["top", "right", "bottom", "left"] as const) check(region.inset![side], `regions.${slot}.inset.${side}`);
    if (region.columns !== undefined && !isObject(region.columns)) errors.push(`regions.${slot}.columns`);
    for (const [column, inset] of Object.entries(isObject(region.columns) ? region.columns! : {})) {
      if (!["left", "right"].includes(column)) errors.push(`regions.${slot}.columns.${column}`);
      if (!isObject(inset)) { errors.push(`regions.${slot}.columns.${column}`); continue; }
      check(inset.left, `regions.${slot}.columns.${column}.left`);
      check(inset.right, `regions.${slot}.columns.${column}.right`);
    }
  }
  if (capabilities.userContent !== undefined && !isObject(capabilities.userContent)) errors.push("userContent");
  if (capabilities.userContent && !["whole", "blocks"].includes(capabilities.userContent.split)) errors.push("userContent.split");
  if (capabilities.userContent && (typeof capabilities.userContent.renderer !== "string" || !capabilities.userContent.renderer.trim())) errors.push("userContent.renderer");
  if (capabilities.usesDateRail !== undefined && typeof capabilities.usesDateRail !== "boolean") errors.push("usesDateRail");
  if (capabilities.topDecoration !== undefined && (typeof capabilities.topDecoration !== "string" || !capabilities.topDecoration.trim())) errors.push("topDecoration");
  if (capabilities.restrictions !== undefined && !isObject(capabilities.restrictions)) errors.push("restrictions");
  for (const [key, reason] of Object.entries(isObject(capabilities.restrictions) ? capabilities.restrictions! : {})) {
    if (!["user.avatarPosition", "user.infoLayout", "page.background", "content.datePosition"].includes(key) || typeof reason !== "string" || !reason.trim()) errors.push(`restrictions.${key}`);
  }
  return errors;
};

/** 未声明的固定能力使用默认值，显式错误必须报告字段而不能静默纠正。 */
export const validateThemeDecisions = (decisions: Partial<ThemeDecisions>): string[] => {
  const errors = validateThemeCapabilities(decisions);
  if (decisions.pageBorder !== undefined && (typeof decisions.pageBorder !== "object" || decisions.pageBorder === null || Array.isArray(decisions.pageBorder))) errors.push("pageBorder");
  if (decisions.layoutType !== undefined && !isPageLayoutTemplateId(decisions.layoutType)) errors.push("layoutType");
  if (decisions.pageBorder?.width !== undefined && (typeof decisions.pageBorder.width !== "number" || !Number.isFinite(decisions.pageBorder.width) || decisions.pageBorder.width < 0)) errors.push("pageBorder.width");
  if (decisions.pageBorder?.color !== undefined && (typeof decisions.pageBorder.color !== "string" || !decisions.pageBorder.color.trim())) errors.push("pageBorder.color");
  if (decisions.pageBackgroundPattern !== undefined && (typeof decisions.pageBackgroundPattern !== "string" || !decisions.pageBackgroundPattern.trim())) errors.push("pageBackgroundPattern");
  return errors;
};
