import type { Component } from "vue";
import { createFileAppearanceRegistry } from "../appearanceRegistry";
import DefaultAppearance from "./themes/default.vue";

// 文件名即外观编号，未声明专属组件时复用默认外观。
export const moduleAppearanceRegistry = createFileAppearanceRegistry(
  import.meta.glob<Component>("./themes/*.vue", { eager: true, import: "default" }),
  DefaultAppearance,
);

/** 解析模块外框外观组件：主题未登记时返回 default */
export const resolveModuleAppearance = (themeId: unknown) =>
  moduleAppearanceRegistry.resolve(themeId);
