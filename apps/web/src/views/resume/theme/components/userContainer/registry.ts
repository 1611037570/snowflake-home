import type { Component } from "vue";
import LegacyAppearance from "./themes/legacy.vue";

/** 个人信息模块外观注册表：外观编号 → 组件。只做静态映射，保证测量时几何立即就绪。 */
export const userAppearanceRegistry: Record<string, Component> = {
  legacy: LegacyAppearance, // 旧版统一外观，按 data-theme 分支保留全部既有主题表现
};

/** 主题编号到外观编号的映射：未登记的主题沿用旧版统一外观，拆分外观时逐条登记。 */
export const userAppearanceByTheme: Record<string, string> = {};

/** 解析个人信息模块实际使用的外观组件，主题未登记或外观编号未知时回退旧版外观。 */
export const resolveUserAppearance = (themeId: string) => {
  const appearanceId = userAppearanceByTheme[themeId];
  return (appearanceId && userAppearanceRegistry[appearanceId]) || userAppearanceRegistry.legacy;
};
