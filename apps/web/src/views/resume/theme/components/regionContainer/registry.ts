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
import SandSidebarMain from "./themes/main/sandSidebar.vue";
import RedWhiteSidebarMain from "./themes/main/redWhiteSidebar.vue";
import NavyGuideUser from "./themes/user/navyGuide.vue";
import NavyGuideMain from "./themes/main/navyGuide.vue";
import SquareTimelineMain from "./themes/main/squareTimeline.vue";
import TealRailMain from "./themes/main/tealRail.vue";

interface RegionAppearanceComponent {
  regionPadding?: RegionPadding | ((ui?: Record<string, any>) => RegionPadding); // 组件声明的区域留白，供分页计算尺寸
  fillsPageTop?: boolean; // 组件是否从首页纸张顶边开始占据整宽
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
    navyGuide: NavyGuideUser, // 深色顶栏下方的个人信息留白
  },
  main: {
    default: DefaultMain, // 普通正文区域底板
    frame: Frame, // 红色边框主题正文底板
    burgundySidebar: BurgundyMain, // 绛红双栏主题侧栏底色
    sandSidebar: SandSidebarMain, // 米色侧栏底色与教育条目分隔线
    redWhiteSidebar: RedWhiteSidebarMain, // 深红侧栏与右栏淡菱形背景
    navyGuide: NavyGuideMain, // 单栏正文的纵向引导线
    squareTimeline: SquareTimelineMain, // 左侧标题与日期共用贯穿时间轴
    tealRail: TealRailMain, // 双栏右侧贯穿线
  },
};

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

/** 由区域外观组件声明首页是否占据纸张顶部。 */
export const resolveRegionFillsPageTop = (themeId: unknown, slot: RegionSlotId): boolean =>
  Boolean((resolveRegionAppearance(themeId, slot) as unknown as RegionAppearanceComponent).fillsPageTop);

/** 按区域和主题编号取得组件。 */
export const resolveRegionAppearance = (
  themeId: unknown,
  slot: RegionSlotId | null,
) => regionAppearanceRegistry[slot || "user"][resolveRegionAppearanceId(themeId, slot)];
