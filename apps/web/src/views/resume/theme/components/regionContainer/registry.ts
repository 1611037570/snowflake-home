import type { Component } from "vue";
import type { RegionSlotId } from "@/views/resume/theme/regionSlots";
import PlainRegion from "./themes/plain.vue";
import AcademicMain from "./themes/main/academic.vue";
import AcademicUser from "./themes/user/academic.vue";
import AngledLineMain from "./themes/main/angledLine.vue";
import MarkerGridMain from "./themes/main/markerGrid.vue";
import MarkerGridUser from "./themes/user/markerGrid.vue";
import MinimalMain from "./themes/main/minimal.vue";
import MinimalUser from "./themes/user/minimal.vue";
import SteadyMain from "./themes/main/steady.vue";
import TimelineMain from "./themes/main/timeline.vue";
import TopUserTwoColumnMain from "./themes/main/topUserTwoColumn.vue";
import TopUserTwoColumnUser from "./themes/user/topUserTwoColumn.vue";
import TwoColumnMain from "./themes/main/twoColumn.vue";
import TwoColumnUser from "./themes/user/twoColumn.vue";
import UserBand from "./themes/user/userBand.vue";
import CurvedHeader from "./themes/user/curvedHeader.vue";
import SloganBandUser from "./themes/user/sloganBand.vue";
import DefaultMain from "./themes/main/default.vue";
import InkMagazineMain from "./themes/main/inkMagazine.vue";
import Frame from "./themes/main/frame.vue";
import BurgundyMain from "./themes/main/burgundySidebar.vue";
import SandSidebarMain from "./themes/main/sandSidebar.vue";
import RedWhiteSidebarMain from "./themes/main/redWhiteSidebar.vue";
import NavyGuideUser from "./themes/user/navyGuide.vue";
import NavyGuideMain from "./themes/main/navyGuide.vue";
import SquareTimelineMain from "./themes/main/squareTimeline.vue";
import RingTimelineMain from "./themes/main/ringTimeline.vue";
import VioletBiographyUser from "./themes/user/violetBiography.vue";
import VioletBiographyMain from "./themes/main/violetBiography.vue";
import TealRailMain from "./themes/main/tealRail.vue";
import TealCardUser from "./themes/user/tealCard.vue";
import InkMagazineUser from "./themes/user/inkMagazine.vue";
import RingTimelineUser from "./themes/user/ringTimeline.vue";
import SquareTimelineUser from "./themes/user/squareTimeline.vue";
import TimelineUser from "./themes/user/timeline.vue";

interface RegionAppearanceComponent {
  fillsPageTop?: boolean; // 组件是否从首页纸张顶边开始占据整宽
  gapBefore?: number; // 区域与前一区域之间的间距覆盖值
}

/** 每个区域直接使用主题编号查找组件，未登记时回退该区域的默认组件。 */
export const regionAppearanceRegistry: Record<RegionSlotId, Record<string, Component>> = {
  slogan: {
    default: PlainRegion, // 标语区域只承载完整的标语组件
  },
  user: {
    default: PlainRegion, // 普通个人信息区域
    minimal: MinimalUser, // 简约：页眉上下等距留白
    academic: AcademicUser, // 学术：个人信息底托与分区标记
    fresh: PlainRegion, // 清新恢复旧版个人信息区域，不绘制新增页眉基线
    frame: PlainRegion, // 红色边框恢复旧版个人信息，不绘制新增页眉色块与细线
    colorBar: PlainRegion, // 色条恢复旧版个人信息区域，不绘制新增页眉色块
    twoColumn: TwoColumnUser, // 双栏：页眉顶部留白与分栏提示线
    topUserTwoColumn: TopUserTwoColumnUser, // 通栏双栏：页眉细分隔线
    stripedRibbon: PlainRegion, // 斜纹飘带恢复旧版个人信息，不绘制新增页眉装饰
    markerGrid: MarkerGridUser, // 荧光网格：页眉底部量尺基线与刻度
    tealCard: TealCardUser, // 顶带下方的个人信息留白
    userBand: UserBand, // 个人信息通栏主题底纹
    curvedHeader: CurvedHeader, // 弧形页眉主题背景
    sloganBand: SloganBandUser, // 标语通栏主题的个人信息内部留白
    navyGuide: NavyGuideUser, // 深色顶栏下方的个人信息留白
    violetBiography: VioletBiographyUser, // 紫色通栏个人信息页眉
    inkMagazine: InkMagazineUser, // 杂志页眉与正文之间的留白
    ringTimeline: RingTimelineUser, // 圆环时间轴页眉下留白
    squareTimeline: SquareTimelineUser, // 方节点时间轴页眉下留白
    timeline: TimelineUser, // 时间轴页眉下留白
  },
  main: {
    default: DefaultMain, // 普通正文区域底板
    minimal: MinimalMain, // 简约：正文首行留白与右对齐日期列基准
    academic: AcademicMain, // 学术：页眉分界线与双栏分区底色
    fresh: DefaultMain, // 清新恢复旧版正文区域，不绘制新增圆角浅底托
    steady: SteadyMain, // 稳重：贯穿竖线与左侧日期列
    frame: Frame, // 红色边框主题正文底板
    timeline: TimelineMain, // 时间轴：正文区贯穿轴线与节点
    colorBar: DefaultMain, // 色条恢复旧版正文，不绘制新增贯穿色条与留白
    twoColumn: TwoColumnMain, // 双栏：左栏浅底与栏间细线
    topUserTwoColumn: TopUserTwoColumnMain, // 通栏双栏：栏间线与正文留白
    stripedRibbon: DefaultMain, // 斜纹飘带恢复旧版正文，不绘制新增斜纹与双栏底色
    slantedLayer: DefaultMain, // 斜切叠片恢复旧版正文，不绘制新增底片与斜边细线
    angledLine: AngledLineMain, // 斜角竖线：正文栏贯穿竖线与斜角节点
    layeredCurve: DefaultMain, // 层叠弧线恢复旧版正文，不绘制新增右上弧线装饰
    markerGrid: MarkerGridMain, // 荧光网格：正文点阵底纹
    inkMagazine: InkMagazineMain, // 杂志双栏正文的浅灰辅助栏
    burgundySidebar: BurgundyMain, // 绛红双栏主题侧栏底色
    sandSidebar: SandSidebarMain, // 米色侧栏底色与教育条目分隔线
    redWhiteSidebar: RedWhiteSidebarMain, // 深红侧栏与右栏淡菱形背景
    navyGuide: NavyGuideMain, // 单栏正文的纵向引导线
    squareTimeline: SquareTimelineMain, // 左侧标题与日期共用贯穿时间轴
    ringTimeline: RingTimelineMain, // 圆环时间轴的栏宽、轴线与节点变量
    violetBiography: VioletBiographyMain, // 圆角渐变正文与双栏分割线
    tealRail: TealRailMain, // 双栏右侧贯穿线
  },
};

/** 主题编号只在当前区域内查找，不跨区域复用外观名称。 */
export const resolveRegionAppearanceId = (
  themeId: unknown,
  slot: RegionSlotId | null,
): string =>
  slot && typeof themeId === "string" && Object.prototype.hasOwnProperty.call(regionAppearanceRegistry[slot], themeId)
    ? themeId
    : "default";

/** 由区域外观组件声明首页是否占据纸张顶部。 */
export const resolveRegionFillsPageTop = (themeId: unknown, slot: RegionSlotId): boolean =>
  Boolean((resolveRegionAppearance(themeId, slot) as unknown as RegionAppearanceComponent).fillsPageTop);

/** 读取区域组件声明的前置间距。 */
export const resolveRegionGapBefore = (themeId: unknown, slot: RegionSlotId): number | undefined =>
  (resolveRegionAppearance(themeId, slot) as unknown as RegionAppearanceComponent).gapBefore;

/** 按区域和主题编号取得组件。 */
export const resolveRegionAppearance = (
  themeId: unknown,
  slot: RegionSlotId | null,
) => regionAppearanceRegistry[slot || "user"][resolveRegionAppearanceId(themeId, slot)];
