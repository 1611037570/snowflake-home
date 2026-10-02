import type { Component } from "vue";
import type { RegionSlotId } from "@/views/resume/theme/regionSlots";
import { resolveViewTemplate } from "@/views/resume/theme/regionPadding";
import BannerAppearance from "./themes/banner.vue";
import BannerRibbonAppearance from "./themes/bannerRibbon.vue";
import PlainAppearance from "./themes/plain.vue";
import UserBandAppearance from "./themes/userBand.vue";
import ViewAppearance from "./themes/view.vue";
import ViewFrameAppearance from "./themes/viewFrame.vue";

/** 区域外观注册表：区域外观编号 → 组件。只做静态映射，保证测量时几何立即就绪。 */
export const regionAppearanceRegistry: Record<string, Component> = {
  plain: PlainAppearance, // 不绘制底色与留白
  view: ViewAppearance, // 默认正文外观：透明底板 + 区域留白
  viewFrame: ViewFrameAppearance, // 白色底板正文外观：白底 + 圆角 + 深色文字
  banner: BannerAppearance, // 顶部标语通栏色带：外扩到页面边缘并保留页面留白
  bannerRibbon: BannerRibbonAppearance, // 顶部标语通栏色带 + 底沿对比色细线
  userBand: UserBandAppearance, // 个人信息通栏底纹：整块铺满页面宽度
};

/** 各槽位的缺省区域外观编号 */
export const defaultRegionAppearance: Record<RegionSlotId, string> = {
  slogan: "banner", // 顶部标语缺省绘制通栏色带
  user: "plain", // 个人信息缺省不绘制
  main: "view", // 正文缺省使用透明底板
};

/** 绘制底板的区域外观编号：正文需要铺满整页时才拉满高度，避免透明外观被无谓拉伸 */
export const regionSurfaceAppearances = new Set<string>(["viewFrame"]);

/**
 * 正文区域的历史外观编号：早期简历把正文外观写在 `ui.theme.view` 里，取值是当时的外观名。
 * 只在这个映射里做历史兼容，避免把主题编号当成区域外观（主题编号可能与区域外观编号同名）。
 */
const legacyViewAppearances: Record<string, string> = {
  frame: "viewFrame",
};

/**
 * 解析正文区域实际使用的区域外观编号。
 * 主题显式声明 `ui.theme.region.main` 时以声明为准；老简历回退历史正文外观；其余用正文缺省外观。
 * 预览的区域容器与「正文是否需要铺满整页」的判断都读这里，保证两处口径一致。
 */
export const resolveMainRegionAppearanceId = (ui: Record<string, any> | undefined): string => {
  const configured = ui?.theme?.region?.main;
  if (typeof configured === "string" && regionAppearanceRegistry[configured]) return configured;
  const legacy = legacyViewAppearances[resolveViewTemplate(ui)];
  return legacy || defaultRegionAppearance.main;
};

/** 解析区域实际使用的区域外观编号：未登记时回退槽位缺省外观 */
export const resolveRegionAppearanceId = (
  regionConfig: Record<string, unknown> | undefined,
  slot: RegionSlotId | null,
): string => {
  if (!slot) return "plain";
  const configured = regionConfig?.[slot];
  if (typeof configured === "string" && regionAppearanceRegistry[configured]) return configured;
  return defaultRegionAppearance[slot];
};

/** 解析区域实际使用的区域外观组件：未登记的槽位、主题未配置或配置了未知编号都按缺省外观回退。 */
export const resolveRegionAppearance = (
  regionConfig: Record<string, unknown> | undefined,
  slot: RegionSlotId | null,
) => regionAppearanceRegistry[resolveRegionAppearanceId(regionConfig, slot)];
