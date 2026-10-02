import { createAppearanceRegistry } from "../appearanceRegistry";
import AngledLineAppearance from "./themes/angledLine.vue";
import DefaultAppearance from "./themes/default.vue";
import OutlineAppearance from "./themes/outline.vue";
import TealCardAppearance from "./themes/tealCard.vue";

/** 模块外框外观注册表：外观编号与主题编号同名，未登记的主题走 default */
export const moduleAppearanceRegistry = createAppearanceRegistry({
  default: DefaultAppearance, // 不绘制外框
  tealCard: TealCardAppearance, // 标题外置，全部条目共用白色卡片
  outline: OutlineAppearance, // 主题色描边
  angledLine: AngledLineAppearance, // 左侧贯穿细线
});

/** 解析模块外框外观组件：主题未登记时返回 default */
export const resolveModuleAppearance = (themeId: unknown) =>
  moduleAppearanceRegistry.resolve(themeId);
