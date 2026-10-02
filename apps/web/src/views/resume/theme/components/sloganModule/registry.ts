import type { Component } from "vue";
import DefaultSlogan from "./themes/default.vue";
import SloganBand from "./themes/sloganBand.vue";
import BurgundySidebar from "./themes/burgundySidebar.vue";

// 自带标语内容的主题直接按主题编号登记对应组件。
const themeSloganComponents: Record<string, Component> = {
  sloganBand: SloganBand, // 标语通栏的固定文案
  burgundySidebar: BurgundySidebar, // 绛红装饰带的分页占位
};

/** 判断主题是否自带标语区域。 */
export const hasThemeSlogan = (themeId: unknown) =>
  typeof themeId === "string" && Object.prototype.hasOwnProperty.call(themeSloganComponents, themeId);

/** 按主题编号选择标语内容，其他主题使用简历数据。 */
export const resolveSloganComponent = (themeId: unknown) =>
  hasThemeSlogan(themeId) ? themeSloganComponents[themeId as string] : DefaultSlogan;
