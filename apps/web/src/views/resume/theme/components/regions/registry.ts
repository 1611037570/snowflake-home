import type { Component } from "vue";
import type { RegionSlotId } from "@/views/resume/theme/regionSlots";
import PlainAppearance from "./themes/plain.vue";
import ViewAppearance from "./themes/view.vue";

/** 区域外观注册表：外观编号 → 组件。只做静态映射，保证测量时几何立即就绪。 */
export const regionAppearanceRegistry: Record<string, Component> = {
  plain: PlainAppearance, // 不绘制底色与留白
  view: ViewAppearance, // 正文容器外观：背景、圆角与内边距读取 viewStyle
};

/** 各槽位的缺省外观编号：slogan 与 user 不绘制，main 沿用正文容器外观。 */
export const defaultRegionAppearance: Record<RegionSlotId, string> = {
  slogan: "plain",
  user: "plain",
  main: "view",
};

/** 解析区域实际使用的外观组件：未登记的槽位、主题未配置或配置了未知编号都按缺省外观回退。 */
export const resolveRegionAppearance = (
  regionConfig: Record<string, unknown> | undefined,
  slot: RegionSlotId | null,
) => {
  if (!slot) return regionAppearanceRegistry.plain;
  const configured = regionConfig?.[slot];
  const appearanceId = typeof configured === "string" ? configured : defaultRegionAppearance[slot];
  return (
    regionAppearanceRegistry[appearanceId] ||
    regionAppearanceRegistry[defaultRegionAppearance[slot]]
  );
};
