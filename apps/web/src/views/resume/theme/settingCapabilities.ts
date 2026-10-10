import { resolveThemeDecisions } from "./themeDecisions";
import type { ThemeRestrictions } from "./themeContract";

export type ThemeSettingRestrictions = ThemeRestrictions;

/** 设置限制只读取固定声明，不检查外观组件或维护主题名称名单。 */
export const resolveThemeSettingRestrictions = (themeId?: string): ThemeSettingRestrictions => {
  const decisions = resolveThemeDecisions(themeId);
  return {
    ...decisions.restrictions, // 主题固定设置及限制原因
    ...(decisions.usesDateRail
      ? { "content.datePosition": "themeFixedDatePosition" } : {}), // 日期栏固定日期位置
  };
};
