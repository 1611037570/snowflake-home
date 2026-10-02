import type { Component } from "vue";
import type { RegionSlotId } from "@/views/resume/theme/regionSlots";
import type { RegionPadding } from "@/views/resume/theme/regionPadding";
import PlainRegion from "./themes/plain.vue";
import AcademicMain from "./themes/main/academic.vue";
import AcademicUser from "./themes/user/academic.vue";
import AngledLineMain from "./themes/main/angledLine.vue";
import ChevronRibbonMain from "./themes/main/chevronRibbon.vue";
import ClassicMain from "./themes/main/classic.vue";
import ClassicUser from "./themes/user/classic.vue";
import ColorBarMain from "./themes/main/colorBar.vue";
import ColorBarUser from "./themes/user/colorBar.vue";
import CreativeMain from "./themes/main/creative.vue";
import CreativeUser from "./themes/user/creative.vue";
import DoubleArrowMain from "./themes/main/doubleArrow.vue";
import DoubleArrowUser from "./themes/user/doubleArrow.vue";
import FoldedLabelMain from "./themes/main/foldedLabel.vue";
import FrameUser from "./themes/user/frame.vue";
import FreshMain from "./themes/main/fresh.vue";
import FreshUser from "./themes/user/fresh.vue";
import LayeredCurveMain from "./themes/main/layeredCurve.vue";
import MarkerGridMain from "./themes/main/markerGrid.vue";
import MarkerGridUser from "./themes/user/markerGrid.vue";
import MinimalMain from "./themes/main/minimal.vue";
import MinimalUser from "./themes/user/minimal.vue";
import ModernMain from "./themes/main/modern.vue";
import SlantedLayerMain from "./themes/main/slantedLayer.vue";
import SteadyMain from "./themes/main/steady.vue";
import StripedRibbonMain from "./themes/main/stripedRibbon.vue";
import StripedRibbonUser from "./themes/user/stripedRibbon.vue";
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

interface RegionAppearanceComponent {
  regionPadding?: RegionPadding | ((ui?: Record<string, any>) => RegionPadding); // 组件声明的区域留白，供分页计算尺寸
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
    classic: ClassicUser, // 经典：页眉上下留白，与正文双线呼应
    academic: AcademicUser, // 学术：个人信息底托与分区标记
    fresh: FreshUser, // 清新：页眉留白与底部主题色基线
    creative: CreativeUser, // 创意：左侧斜切色块与页眉留白
    frame: FrameUser, // 红框：页眉色块与收口细线
    colorBar: ColorBarUser, // 色条：首屏色块页眉，向下衔接正文色条
    twoColumn: TwoColumnUser, // 双栏：页眉顶部留白与分栏提示线
    topUserTwoColumn: TopUserTwoColumnUser, // 通栏双栏：页眉细分隔线
    stripedRibbon: StripedRibbonUser, // 斜纹飘带：页眉平行斜纹与下缘斜纹底
    doubleArrow: DoubleArrowUser, // 双箭横线：页眉箭头引导符与水平留白
    markerGrid: MarkerGridUser, // 荧光网格：页眉底部量尺基线与刻度
    tealCard: TealCardUser, // 顶带下方的个人信息留白
    userBand: UserBand, // 个人信息通栏主题底纹
    curvedHeader: CurvedHeader, // 弧形页眉主题背景
    sloganBand: SloganBandUser, // 标语通栏主题的个人信息内部留白
    navyGuide: NavyGuideUser, // 深色顶栏下方的个人信息留白
    violetBiography: VioletBiographyUser, // 紫色通栏个人信息页眉
  },
  main: {
    default: DefaultMain, // 普通正文区域底板
    minimal: MinimalMain, // 简约：正文首行留白与右对齐日期列基准
    modern: ModernMain, // 现代：左侧贯穿细条与模块分隔线
    classic: ClassicMain, // 经典：正文上下双细线
    academic: AcademicMain, // 学术：页眉分界线与双栏分区底色
    fresh: FreshMain, // 清新：柔和圆角浅底托
    creative: CreativeMain, // 创意：单栏斜切柱体与双栏栏底色
    steady: SteadyMain, // 稳重：贯穿竖线与左侧日期列
    frame: Frame, // 红色边框主题正文底板
    timeline: TimelineMain, // 时间轴：正文区贯穿轴线与节点
    colorBar: ColorBarMain, // 色条：左侧贯穿色条
    twoColumn: TwoColumnMain, // 双栏：左栏浅底与栏间细线
    topUserTwoColumn: TopUserTwoColumnMain, // 通栏双栏：栏间线与正文留白
    chevronRibbon: ChevronRibbonMain, // 箭头长条：正文右缘细飘带与顶端短箭头
    stripedRibbon: StripedRibbonMain, // 斜纹飘带：右缘斜纹条与双栏底色
    slantedLayer: SlantedLayerMain, // 斜切叠片：左下斜切底片与斜边细线
    angledLine: AngledLineMain, // 斜角竖线：正文栏贯穿竖线与斜角节点
    layeredCurve: LayeredCurveMain, // 层叠弧线：正文右上三层错位弧线
    doubleArrow: DoubleArrowMain, // 双箭横线：右缘贯穿引导线与双箭头收口
    foldedLabel: FoldedLabelMain, // 折角色块：正文左上折角
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

/** 读取区域组件声明的前置间距。 */
export const resolveRegionGapBefore = (themeId: unknown, slot: RegionSlotId): number | undefined =>
  (resolveRegionAppearance(themeId, slot) as unknown as RegionAppearanceComponent).gapBefore;

/** 按区域和主题编号取得组件。 */
export const resolveRegionAppearance = (
  themeId: unknown,
  slot: RegionSlotId | null,
) => regionAppearanceRegistry[slot || "user"][resolveRegionAppearanceId(themeId, slot)];
