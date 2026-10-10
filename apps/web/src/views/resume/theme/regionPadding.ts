import { isRegionSlotId, type RegionSlotId } from "@/domain/resume/theme/regionSlots";
import { resolveThemeDecisions } from "@/domain/resume/theme/themeDecisions";
import { EMPTY_THEME_INSET, type ThemeInset } from "@/domain/resume/theme/themeContract";

export type RegionPadding = ThemeInset;

/** 外部接入入口：布局内部直接读取已解析主题，避免读取外观组件。 */
export const resolveRegionPadding = (
  ui: Record<string, any> | undefined,
  slot: RegionSlotId | string,
): RegionPadding => resolveThemeDecisions(ui?.theme?.template).regions?.[isRegionSlotId(slot) ? slot : "user"]?.inset ?? EMPTY_THEME_INSET;
