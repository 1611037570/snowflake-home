import { createAppearanceRegistry } from "../appearanceRegistry";
import DashedGridPattern from "./themes/dashedGrid.vue";
import DefaultPattern from "./themes/default.vue";

/**
 * 页面外观注册表：编号与 `ui.page.backgroundPattern` 取值同名，未配置时走 default。
 * 页面级外观目前只有背景纹理，后续新增页面级绘制同样登记在这里。
 */
export const pageAppearanceRegistry = createAppearanceRegistry({
  default: DefaultPattern, // 不绘制图案
  dashedGrid: DashedGridPattern, // 虚线网格纹理
});

/** 解析页面外观组件 */
export const resolvePageAppearance = (appearanceId: unknown) =>
  pageAppearanceRegistry.resolve(appearanceId);
