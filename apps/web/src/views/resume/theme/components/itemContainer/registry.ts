import type { Component } from "vue";
import { createFileAppearanceRegistry } from "../appearanceRegistry";
import DefaultAppearance from "./themes/default.vue";

// 文件名即外观编号，未声明专属组件时复用默认外观。
export const itemAppearanceRegistry = createFileAppearanceRegistry(
  import.meta.glob<Component>("./themes/*.vue", { eager: true, import: "default" }),
  DefaultAppearance,
);

/** 解析条目外观组件：主题未登记时返回 default */
export const resolveItemAppearance = (themeId: unknown) => itemAppearanceRegistry.resolve(themeId);

/** 读取条目外观自行声明的日期栏能力：未声明表示不使用左侧日期栏 */
export const resolveItemAppearanceUsesDateRail = (themeId: unknown) =>
  Boolean(resolveItemAppearance(themeId).usesDateRail);
