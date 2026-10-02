import type { Component } from "vue";
import type { RegionSlotId } from "@/views/resume/theme/regionSlots";
import type { RegionPadding } from "@/views/resume/theme/regionPadding";
import DefaultAppearance from "./themes/default.vue";
import CurvedHeaderAppearance from "./themes/curvedHeader.vue";
import FrameAppearance from "./themes/frame.vue";
import MainDefaultAppearance from "./themes/mainDefault.vue";
import SloganBandAppearance from "./themes/sloganBand.vue";
import SloganBandRibbonAppearance from "./themes/sloganBandRibbon.vue";
import UserBandAppearance from "./themes/userBand.vue";
import BurgundyBandAppearance from "./themes/burgundyBand.vue";
import BurgundySidebarAppearance from "./themes/burgundySidebar.vue";

interface RegionAppearanceComponent {
  regionPadding?: RegionPadding | ((ui?: Record<string, any>) => RegionPadding); // 组件自身解析的区域留白，供分页计算尺寸
  fillsPage?: boolean; // 区域是否铺满页面剩余高度
}

/**
 * 区域外观注册表：编号 → 组件，主题只通过编号选择组件。
 * 只做静态映射，保证测量时几何立即就绪；未登记时按槽位缺省外观回退。
 */
export const regionAppearanceRegistry: Record<string, Component> = {
  default: DefaultAppearance, // 通用缺省：不绘制底色与留白
  mainDefault: MainDefaultAppearance, // 正文缺省：透明底板 + 区域留白
  sloganBand: SloganBandAppearance, // 标语通栏色带
  sloganBandRibbon: SloganBandRibbonAppearance, // 标语通栏色带 + 底沿对比色细线
  userBand: UserBandAppearance, // 个人信息通栏底纹：整块铺满页面宽度
  curvedHeader: CurvedHeaderAppearance, // 个人信息通栏弧形页眉背景
  frame: FrameAppearance, // 正文白色底板 + 圆角（frame 主题）
  burgundyBand: BurgundyBandAppearance, // 首页绛红装饰带
  burgundySidebar: BurgundySidebarAppearance, // 双栏正文自身绘制连续侧栏底色
};

/** 各槽位的缺省区域外观编号 */
export const defaultRegionAppearance: Record<RegionSlotId, string> = {
  slogan: "sloganBand", // 顶部标语缺省绘制通栏色带
  user: "default", // 个人信息缺省不绘制
  main: "mainDefault", // 正文缺省使用透明底板
};

/** 从组件自身声明取得需要铺满页面的外观编号。 */
export const regionSurfaceAppearances = new Set<string>(
  Object.entries(regionAppearanceRegistry)
    .filter(([, component]) => (component as unknown as RegionAppearanceComponent).fillsPage)
    .map(([id]) => id),
);

/** 主题编号决定各区域使用的组件；未登记的主题沿用对应槽位的默认组件。 */
const themeRegionAppearances: Record<RegionSlotId, Record<string, string>> = {
  slogan: { sloganBand: "sloganBandRibbon", burgundySidebar: "burgundyBand" }, // 标语主题使用对应色带组件
  user: { userBand: "userBand", curvedHeader: "curvedHeader" }, // 个人信息通栏主题使用各自组件
  main: { frame: "frame", burgundySidebar: "burgundySidebar" }, // 正文底板由主题选择组件
};

const emptyRegionPadding = {
  top: 0, // 无额外上留白
  right: 0, // 无额外右留白
  bottom: 0, // 无额外下留白
  left: 0, // 无额外左留白
};

/** 主题是否自带标语内容。 */
export const hasThemeSlogan = (themeId: unknown) =>
  typeof themeId === "string" && themeId in themeRegionAppearances.slogan;

/** 按主题编号解析区域外观；未知主题回退槽位默认组件。 */
export const resolveRegionAppearanceId = (
  themeId: unknown,
  slot: RegionSlotId | null,
): string => {
  if (!slot) return "default";
  return typeof themeId === "string"
    ? themeRegionAppearances[slot][themeId] || defaultRegionAppearance[slot]
    : defaultRegionAppearance[slot];
};

/** 读取所选外观组件自身声明的留白。 */
export const resolveRegionAppearancePadding = (
  themeId: unknown,
  slot: RegionSlotId | null,
  ui?: Record<string, any>,
) => {
  const appearance = resolveRegionAppearance(themeId, slot) as unknown as RegionAppearanceComponent;
  return typeof appearance.regionPadding === "function"
    ? appearance.regionPadding(ui)
    : appearance.regionPadding || emptyRegionPadding;
};

/** 解析区域实际使用的区域外观组件。 */
export const resolveRegionAppearance = (
  themeId: unknown,
  slot: RegionSlotId | null,
) => regionAppearanceRegistry[resolveRegionAppearanceId(themeId, slot)];
