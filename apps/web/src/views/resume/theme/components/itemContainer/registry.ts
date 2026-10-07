import { createAppearanceRegistry } from "../appearanceRegistry";
import AcademicAppearance from "./themes/academic.vue";
import AngledLineAppearance from "./themes/angledLine.vue";
import DefaultAppearance from "./themes/default.vue";
import MarkerGridAppearance from "./themes/markerGrid.vue";
import OutlineAppearance from "./themes/outline.vue";
import RingTimelineAppearance from "./themes/ringTimeline.vue";
import SandSidebarAppearance from "./themes/sandSidebar.vue";
import TealCardAppearance from "./themes/tealCard.vue";
import TopUserTwoColumnAppearance from "./themes/topUserTwoColumn.vue";
import VividAppearance from "./themes/vivid.vue";

/** 条目外观注册表：外观编号与主题编号同名，未登记的主题走 default */
export const itemAppearanceRegistry = createAppearanceRegistry({
  default: DefaultAppearance, // 不绘制底色与边框
  minimal: DefaultAppearance, // 简约条目不定制内边距、下划线或日期列装饰
  academic: AcademicAppearance, // 引用式左缩进条目：浅色面板 + 左侧引线
  fresh: DefaultAppearance, // 清新恢复旧版条目，不绘制新增浅色底托
  frame: DefaultAppearance, // 红色边框恢复旧版条目，不绘制新增分隔线与内边距
  colorBar: DefaultAppearance, // 色条恢复旧版条目，不绘制新增底托与短条
  twoColumn: DefaultAppearance, // 双栏条目只承载内容，不绘制底色与边框或额外留白
  topUserTwoColumn: TopUserTwoColumnAppearance, // 通栏双栏条目：直角浅底托与主题色细描边
  stripedRibbon: DefaultAppearance, // 斜纹飘带恢复旧版条目，不绘制新增斜纹装饰
  slantedLayer: DefaultAppearance, // 斜切叠片恢复旧版条目，不绘制新增底片与斜边细线
  layeredCurve: DefaultAppearance, // 层叠弧线恢复旧版条目，不绘制新增圆角底片与错位装饰
  tealCard: TealCardAppearance, // 整组卡片内的条目留白
  vivid: VividAppearance, // 浅色底托 + 主题色描边 + 圆角
  sandSidebar: SandSidebarAppearance, // 金棕色经历名称与条目末尾留白
  outline: OutlineAppearance, // 只保留内边距，外框由模块绘制
  ringTimeline: RingTimelineAppearance, // 圆环时间轴：日期栏 + 空心圆环节点
  angledLine: AngledLineAppearance, // 条目向模块竖线内侧留白
  labelLine: DefaultAppearance, // 色块横线恢复旧版条目，不绘制新增竖色块与短横线
  markerGrid: MarkerGridAppearance, // 条目内平铺点阵底纹与首段刻度线
  squareTimeline: DefaultAppearance, // 方节点时间轴使用默认条目，名称与日期不加定制底色和节点
});

/** 解析条目外观组件：主题未登记时返回 default */
export const resolveItemAppearance = (themeId: unknown) => itemAppearanceRegistry.resolve(themeId);

/** 读取条目外观自行声明的日期栏能力：未声明表示不使用左侧日期栏 */
export const resolveItemAppearanceUsesDateRail = (themeId: unknown) =>
  Boolean((resolveItemAppearance(themeId) as { usesDateRail?: boolean } | undefined)?.usesDateRail);
