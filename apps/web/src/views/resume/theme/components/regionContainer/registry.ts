import type { Component } from "vue";
import type { RegionSlotId } from "@/views/resume/theme/regionSlots";
import { createFileAppearanceRegistry } from "../appearanceRegistry";
import type { AppearanceComponent } from "../appearanceRegistry";
import PlainRegion from "./themes/plain.vue";
import DefaultMain from "./themes/main/default.vue";

// 各槽位按文件名自动登记，默认组件只维护一处。
export const regionAppearanceRegistry: Record<RegionSlotId, Record<string, AppearanceComponent> & { default: AppearanceComponent }> = {
  slogan: { default: PlainRegion }, // 标语区域默认外观
  user: createFileAppearanceRegistry(
    import.meta.glob<Component>("./themes/user/*.vue", { eager: true, import: "default" }),
    PlainRegion,
  ).components, // 个人信息区域外观
  main: createFileAppearanceRegistry(
    import.meta.glob<Component>("./themes/main/*.vue", { eager: true, import: "default" }),
    DefaultMain,
  ).components, // 正文区域外观
};

/** 主题编号只在当前区域内查找，不跨区域复用外观名称。 */
export const resolveRegionAppearanceId = (
  themeId: unknown,
  slot: RegionSlotId | null,
): string =>
  slot && typeof themeId === "string" && Object.prototype.hasOwnProperty.call(regionAppearanceRegistry[slot], themeId)
    ? themeId
    : "default";

/** 由区域外观组件声明首页是否占据纸张顶部。 */
export const resolveRegionFillsPageTop = (themeId: unknown, slot: RegionSlotId): boolean =>
  Boolean(resolveRegionAppearance(themeId, slot).fillsPageTop);

/** 读取区域组件声明的前置间距。 */
export const resolveRegionGapBefore = (themeId: unknown, slot: RegionSlotId): number | undefined =>
  resolveRegionAppearance(themeId, slot).gapBefore;

/** 按区域和主题编号取得组件。 */
export const resolveRegionAppearance = (
  themeId: unknown,
  slot: RegionSlotId | null,
) => regionAppearanceRegistry[slot || "user"][resolveRegionAppearanceId(themeId, slot)]
  || regionAppearanceRegistry[slot || "user"].default;
