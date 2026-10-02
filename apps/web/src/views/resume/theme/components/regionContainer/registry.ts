import type { Component } from "vue";
import type { RegionSlotId } from "@/views/resume/theme/regionSlots";
import { resolveViewTemplate } from "@/views/resume/theme/regionPadding";
import DefaultAppearance from "./themes/default.vue";
import FrameAppearance from "./themes/frame.vue";
import MainDefaultAppearance from "./themes/mainDefault.vue";
import SloganBandAppearance from "./themes/sloganBand.vue";
import SloganBandRibbonAppearance from "./themes/sloganBandRibbon.vue";
import UserBandAppearance from "./themes/userBand.vue";

/**
 * 区域外观注册表：编号 → 组件，编号与写入 `ui.theme.region` 的取值同名。
 * 只做静态映射，保证测量时几何立即就绪；未登记时按槽位缺省外观回退。
 */
export const regionAppearanceRegistry: Record<string, Component> = {
  default: DefaultAppearance, // 通用缺省：不绘制底色与留白
  mainDefault: MainDefaultAppearance, // 正文缺省：透明底板 + 区域留白
  sloganBand: SloganBandAppearance, // 标语通栏色带
  sloganBandRibbon: SloganBandRibbonAppearance, // 标语通栏色带 + 底沿对比色细线
  userBand: UserBandAppearance, // 个人信息通栏底纹：整块铺满页面宽度
  frame: FrameAppearance, // 正文白色底板 + 圆角（frame 主题）
};

/** 各槽位的缺省区域外观编号 */
export const defaultRegionAppearance: Record<RegionSlotId, string> = {
  slogan: "sloganBand", // 顶部标语缺省绘制通栏色带
  user: "default", // 个人信息缺省不绘制
  main: "mainDefault", // 正文缺省使用透明底板
};

/** 绘制底板的区域外观编号：正文需要铺满整页时才拉满高度，避免透明外观被无谓拉伸 */
export const regionSurfaceAppearances = new Set<string>(["frame"]);

/**
 * 正文区域的历史外观编号。
 * 早期简历把正文外观写在 `ui.theme.view` 里，取值是当时的外观名；
 * 只在这个映射里做历史兼容，避免把主题编号当成区域外观（两者可能同名）。
 */
const legacyMainAppearances: Record<string, string> = {
  frame: "frame", // 历史编号与现名一致：白色底板
  viewFrame: "frame", // 短暂存在过的白色底板编号
  view: "mainDefault", // 历史编号：透明底板
};

/**
 * 解析正文区域实际使用的区域外观编号。
 * 主题显式声明 `ui.theme.region.main` 时以声明为准；老简历回退历史正文外观；其余用正文缺省外观。
 * 预览的区域容器与「正文是否需要铺满整页」的判断都读这里，保证两处口径一致。
 */
export const resolveMainRegionAppearanceId = (ui: Record<string, any> | undefined): string => {
  const configured = ui?.theme?.region?.main;
  if (typeof configured === "string" && regionAppearanceRegistry[configured]) return configured;
  return legacyMainAppearances[resolveViewTemplate(ui)] || defaultRegionAppearance.main;
};

/** 解析区域实际使用的区域外观编号：未登记时回退槽位缺省外观 */
export const resolveRegionAppearanceId = (
  regionConfig: Record<string, unknown> | undefined,
  slot: RegionSlotId | null,
): string => {
  if (!slot) return "default";
  const configured = regionConfig?.[slot];
  if (typeof configured === "string" && regionAppearanceRegistry[configured]) return configured;
  return defaultRegionAppearance[slot];
};

/** 解析区域实际使用的区域外观组件：未登记的槽位、主题未配置或配置了未知编号都按缺省外观回退。 */
export const resolveRegionAppearance = (
  regionConfig: Record<string, unknown> | undefined,
  slot: RegionSlotId | null,
) => regionAppearanceRegistry[resolveRegionAppearanceId(regionConfig, slot)];
