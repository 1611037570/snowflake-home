import { createAppearanceRegistry } from "../appearanceRegistry";
import AcademicAppearance from "./themes/academic.vue";
import AngledLineAppearance from "./themes/angledLine.vue";
import ColorBarAppearance from "./themes/colorBar.vue";
import CreativeAppearance from "./themes/creative.vue";
import DefaultAppearance from "./themes/default.vue";
import DoubleArrowAppearance from "./themes/doubleArrow.vue";
import FoldedLabelAppearance from "./themes/foldedLabel.vue";
import FrameAppearance from "./themes/frame.vue";
import LabelLineAppearance from "./themes/labelLine.vue";
import LayeredCurveAppearance from "./themes/layeredCurve.vue";
import MarkerGridAppearance from "./themes/markerGrid.vue";
import OutlineAppearance from "./themes/outline.vue";
import RingTimelineAppearance from "./themes/ringTimeline.vue";
import SandSidebarAppearance from "./themes/sandSidebar.vue";
import SteadyAppearance from "./themes/steady.vue";
import TealCardAppearance from "./themes/tealCard.vue";
import TimelineAppearance from "./themes/timeline.vue";
import TopUserTwoColumnAppearance from "./themes/topUserTwoColumn.vue";
import TwoColumnAppearance from "./themes/twoColumn.vue";
import VividAppearance from "./themes/vivid.vue";

/** 条目外观注册表：外观编号与主题编号同名，未登记的主题走 default */
export const itemAppearanceRegistry = createAppearanceRegistry({
  default: DefaultAppearance, // 不绘制底色与边框
  minimal: DefaultAppearance, // 简约条目不定制内边距、下划线或日期列装饰
  academic: AcademicAppearance, // 引用式左缩进条目：浅色面板 + 左侧引线
  fresh: DefaultAppearance, // 清新恢复旧版条目，不绘制新增浅色底托
  creative: CreativeAppearance, // 左侧斜切强调竖线与浅底色条目
  steady: SteadyAppearance, // 左侧固定日期列与贯穿竖线的条目
  frame: FrameAppearance, // 白底正文内的条目细分隔线与内边距
  colorBar: ColorBarAppearance, // 浅色底托与左端主题色短条
  twoColumn: TwoColumnAppearance, // 双栏条目：紧凑留白与浅底圆角卡片
  topUserTwoColumn: TopUserTwoColumnAppearance, // 通栏双栏条目：直角浅底托与主题色细描边
  stripedRibbon: DefaultAppearance, // 斜纹飘带恢复旧版条目，不绘制新增斜纹装饰
  slantedLayer: DefaultAppearance, // 斜切叠片恢复旧版条目，不绘制新增底片与斜边细线
  layeredCurve: LayeredCurveAppearance, // 层叠底片：浅底圆角与右下错位底片
  doubleArrow: DoubleArrowAppearance, // 双箭条目：左端双箭头标识与右缘箭头列
  foldedLabel: FoldedLabelAppearance, // 折角标签：主题色块与右上角折角
  tealCard: TealCardAppearance, // 整组卡片内的条目留白
  vivid: VividAppearance, // 浅色底托 + 主题色描边 + 圆角
  sandSidebar: SandSidebarAppearance, // 金棕色经历名称与条目末尾留白
  outline: OutlineAppearance, // 只保留内边距，外框由模块绘制
  ringTimeline: RingTimelineAppearance, // 圆环时间轴：日期栏 + 空心圆环节点
  angledLine: AngledLineAppearance, // 条目向模块竖线内侧留白
  labelLine: LabelLineAppearance, // 左端竖色块接短横线，日期与标题色块对齐
  markerGrid: MarkerGridAppearance, // 条目内平铺点阵底纹与首段刻度线
  timeline: TimelineAppearance, // 左侧固定日期栏的时间轴条目
  squareTimeline: TimelineAppearance, // 方节点时间轴复用同一份日期栏条目
});

/** 解析条目外观组件：主题未登记时返回 default */
export const resolveItemAppearance = (themeId: unknown) => itemAppearanceRegistry.resolve(themeId);

/** 读取条目外观自行声明的日期栏能力：未声明表示不使用左侧日期栏 */
export const resolveItemAppearanceUsesDateRail = (themeId: unknown) =>
  Boolean((resolveItemAppearance(themeId) as { usesDateRail?: boolean } | undefined)?.usesDateRail);
