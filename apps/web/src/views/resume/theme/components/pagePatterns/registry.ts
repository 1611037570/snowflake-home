import { createAppearanceRegistry } from "../appearanceRegistry";
import DashedGridPattern from "./themes/dashedGrid.vue";
import DefaultPattern from "./themes/default.vue";

/** 页面背景纹理注册表：编号与 ui.page.backgroundPattern 取值同名，未配置时走 default */
export const pagePatternRegistry = createAppearanceRegistry({
  default: DefaultPattern, // 不绘制图案
  dashedGrid: DashedGridPattern, // 虚线网格纹理
});

/** 解析页面背景纹理组件 */
export const resolvePagePattern = (patternId: unknown) => pagePatternRegistry.resolve(patternId);
