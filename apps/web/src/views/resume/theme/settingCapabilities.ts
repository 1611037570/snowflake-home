import { resolveThemeDecisions } from "./themeDecisions";
import { resolveUserContent } from "./components/userModule/registry";
import { resolvePageAppearance } from "./components/pageContainer/registry";
import { resolveItemAppearanceUsesDateRail } from "./components/itemContainer/registry";

/** 主题固定设置及对应的限制说明文案标识。 */
export type ThemeSettingRestrictions = Partial<
  Record<
    | "user.avatarPosition" // 头像位置
    | "user.infoLayout" // 个人资料布局
    | "page.background" // 纸张背景色
    | "content.datePosition", // 经历日期位置
    string
  >
>;

interface SettingCapability {
  /** 外观组件不支持调整的设置及原因文案标识。 */
  unsupportedSettings?: ThemeSettingRestrictions;
}

// 按实际使用的外观组件读取限制，设置面板不维护独立的主题名单。
export const resolveThemeSettingRestrictions = (themeId?: string): ThemeSettingRestrictions => {
  const decisions = resolveThemeDecisions(themeId);
  const user = resolveUserContent(themeId, decisions.layoutType) as SettingCapability;
  const page = resolvePageAppearance(
    decisions.pageBackgroundPattern || themeId,
  ) as SettingCapability;
  return {
    ...user.unsupportedSettings,
    ...page.unsupportedSettings,
    ...(resolveItemAppearanceUsesDateRail(themeId)
      ? { "content.datePosition": "themeFixedDatePosition" } // 时间轴固定日期栏位置
      : {}),
  };
};
