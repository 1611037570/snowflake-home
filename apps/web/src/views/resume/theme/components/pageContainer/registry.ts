import { createAppearanceRegistry } from "../appearanceRegistry";
import DashedGridPattern from "./themes/dashedGrid.vue";
import DefaultPattern from "./themes/default.vue";
import SongElegancePattern from "./themes/songElegance.vue";
import VioletBiographyPattern from "./themes/violetBiography.vue";

/**
 * 页面外观注册表：优先使用页面纹理编号，未指定时按主题编号查找。
 * 页面级背景由对应组件绘制，未登记时走 default。
 */
export const pageAppearanceRegistry = createAppearanceRegistry({
  default: DefaultPattern, // 不绘制图案
  dashedGrid: DashedGridPattern, // 虚线网格纹理
  violetBiography: VioletBiographyPattern, // 紫色履历的整页渐变底色
  songElegance: SongElegancePattern, // 宋韵雅致的极淡横格纸张纹理
});

/** 解析页面外观组件 */
export const resolvePageAppearance = (appearanceId: unknown) =>
  pageAppearanceRegistry.resolve(appearanceId);
