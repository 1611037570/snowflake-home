import type { Component } from "vue";
import type { RegionSlotId } from "@/views/resume/theme/regionSlots";
import type { RegionPadding } from "@/views/resume/theme/regionPadding";
import PlainRegion from "./themes/plain.vue";
import UserBand from "./themes/user/userBand.vue";
import CurvedHeader from "./themes/user/curvedHeader.vue";
import SloganBandUser from "./themes/user/sloganBand.vue";
import DefaultMain from "./themes/main/default.vue";
import Frame from "./themes/main/frame.vue";
import BurgundyMain from "./themes/main/burgundySidebar.vue";

interface RegionAppearanceComponent {
  regionPadding?: RegionPadding | ((ui?: Record<string, any>) => RegionPadding); // 组件声明的区域留白，供分页计算尺寸
  fillsPage?: boolean; // 组件是否铺满页面剩余高度
}

/** 每个区域直接使用主题编号查找组件，未登记时回退该区域的默认组件。 */
export const regionAppearanceRegistry: Record<RegionSlotId, Record<string, Component>> = {
  slogan: {
    default: PlainRegion, // 标语区域只承载完整的标语组件
  },
  user: {
    default: PlainRegion, // 普通个人信息区域
    userBand: UserBand, // 个人信息通栏主题底纹
    curvedHeader: CurvedHeader, // 弧形页眉主题背景
    sloganBand: SloganBandUser, // 标语通栏主题的个人信息内部留白
  },
  main: {
    default: DefaultMain, // 普通正文区域底板
    frame: Frame, // 红色边框主题正文底板
    burgundySidebar: BurgundyMain, // 绛红双栏主题侧栏底色
  },
};

/** 从正文组件自身声明读取需要铺满页面的主题编号。 */
export const regionSurfaceAppearances = new Set<string>(
  Object.entries(regionAppearanceRegistry.main)
    .filter(([, component]) => (component as unknown as RegionAppearanceComponent).fillsPage)
    .map(([id]) => id),
);

const emptyRegionPadding = {
  top: 0, // 无额外上留白
  right: 0, // 无额外右留白
  bottom: 0, // 无额外下留白
  left: 0, // 无额外左留白
};

/** 主题编号只在当前区域内查找，不跨区域复用外观名称。 */
export const resolveRegionAppearanceId = (
  themeId: unknown,
  slot: RegionSlotId | null,
): string =>
  slot && typeof themeId === "string" && Object.prototype.hasOwnProperty.call(regionAppearanceRegistry[slot], themeId)
    ? themeId
    : "default";

/** 读取所选区域组件声明的留白。 */
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

/** 按区域和主题编号取得组件。 */
export const resolveRegionAppearance = (
  themeId: unknown,
  slot: RegionSlotId | null,
) => regionAppearanceRegistry[slot || "user"][resolveRegionAppearanceId(themeId, slot)];
