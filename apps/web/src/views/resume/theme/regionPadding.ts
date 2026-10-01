import { DEFAULT_UI } from "@/stores/modules/resume/config/uiConfig";
import { getLegacyMainRegionPadding } from "@/views/resume/theme/styles/themeStyles";
import { isRegionSlotId, type RegionSlotId } from "@/views/resume/theme/regionSlots";

/** 区域四周留白，单位为像素 */
export interface RegionPadding {
  /** 上留白 */
  top: number;
  /** 右留白 */
  right: number;
  /** 下留白 */
  bottom: number;
  /** 左留白 */
  left: number;
}

/** 留白四向键，解析时逐向回退，主题只声明其中一侧也能生效 */
const PADDING_SIDES = ["top", "right", "bottom", "left"] as const;

/** 逐向合并主题声明与回退值：声明缺失或非法的方向取回退值 */
const mergePadding = (declared: unknown, fallback: RegionPadding): RegionPadding => {
  if (!declared || typeof declared !== "object") return { ...fallback };
  return PADDING_SIDES.reduce<RegionPadding>(
    (padding, side) => {
      const value = Number((declared as Record<string, unknown>)[side]);
      padding[side] = Number.isFinite(value) ? Math.max(0, value) : fallback[side];
      return padding;
    },
    { ...fallback },
  );
};

/** 取默认区域留白：未在主题里声明区域留白的简历沿用默认值 */
export const getDefaultRegionPadding = (slot: RegionSlotId): RegionPadding =>
  (DEFAULT_UI.region as Record<string, { padding: RegionPadding }>)[slot]?.padding || {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

/**
 * 解析区域留白。
 * 引擎用它扣除栏宽与每页可用高度，区域外观组件用同一份结果确定自身内边距，
 * 两处必须读同一个函数，否则渲染与分页会静默错位。
 */
export const resolveRegionPadding = (
  ui: Record<string, any> | undefined,
  slot: RegionSlotId | string,
): RegionPadding =>
  mergePadding(
    ui?.region?.[slot]?.padding,
    isRegionSlotId(slot) ? getDefaultRegionPadding(slot) : getDefaultRegionPadding("user"),
  );

/**
 * 解析正文外观编号。
 * `ui.theme.view` 为 auto 或缺失时跟随主题编号，未登记的外观由注册表回退 default。
 */
export const resolveViewTemplate = (ui: Record<string, any> | undefined): string => {
  const configured = ui?.theme?.view;
  if (!configured || configured === "auto") return ui?.theme?.template || "default";
  return configured;
};

/**
 * 解析正文区域当前生效的留白。
 * 主题显式声明优先，未声明时按正文外观编号取历史回退值，
 * 引擎与正文容器外观都必须调用这个函数，避免两侧各算一份。
 */
export const resolveCurrentMainRegionPadding = (
  ui: Record<string, any> | undefined,
): RegionPadding =>
  resolveMainRegionPadding(ui, getLegacyMainRegionPadding(resolveViewTemplate(ui)));

/**
 * 解析正文区域留白。
 * 主题未声明正文区域留白时沿用正文容器历史留白，
 * 声明后即可覆盖容器留白；引擎与正文容器外观读同一份结果。
 * @param ui 简历主题配置
 * @param containerPadding 未声明时的单侧留白，单位为像素
 */
export const resolveMainRegionPadding = (
  ui: Record<string, any> | undefined,
  containerPadding: number,
): RegionPadding => {
  const value = Math.max(0, Number(containerPadding) || 0);
  const fallback: RegionPadding = { top: value, right: value, bottom: value, left: value };
  return mergePadding(ui?.region?.main?.padding, fallback);
};
