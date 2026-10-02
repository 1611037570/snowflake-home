import { createAppearanceRegistry } from "../appearanceRegistry";
import AngledLineAppearance from "./themes/angledLine.vue";
import DefaultAppearance from "./themes/default.vue";
import OutlineAppearance from "./themes/outline.vue";
import TealCardAppearance from "./themes/tealCard.vue";
import TimelineAppearance from "./themes/timeline.vue";
import VividAppearance from "./themes/vivid.vue";
import SandSidebarAppearance from "./themes/sandSidebar.vue";

/** 条目外观注册表：外观编号与主题编号同名，未登记的主题走 default */
export const itemAppearanceRegistry = createAppearanceRegistry({
  default: DefaultAppearance, // 不绘制底色与边框
  tealCard: TealCardAppearance, // 整组卡片内的条目留白
  vivid: VividAppearance, // 浅色底托 + 主题色描边 + 圆角
  sandSidebar: SandSidebarAppearance, // 金棕色经历名称与条目末尾留白
  outline: OutlineAppearance, // 只保留内边距，外框由模块绘制
  angledLine: AngledLineAppearance, // 条目向模块竖线内侧留白
  timeline: TimelineAppearance, // 左侧固定日期栏的时间轴条目
  squareTimeline: TimelineAppearance, // 方节点时间轴复用同一份日期栏条目
});

/** 解析条目外观组件：主题未登记时返回 default */
export const resolveItemAppearance = (themeId: unknown) => itemAppearanceRegistry.resolve(themeId);

/** 读取条目外观自行声明的日期栏能力：未声明表示不使用左侧日期栏 */
export const resolveItemAppearanceUsesDateRail = (themeId: unknown) =>
  Boolean((resolveItemAppearance(themeId) as { usesDateRail?: boolean } | undefined)?.usesDateRail);
