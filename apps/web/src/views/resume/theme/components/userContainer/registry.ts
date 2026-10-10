import type { Component } from "vue";
import { createFileAppearanceRegistry } from "../appearanceRegistry";
import DefaultAppearance from "./themes/default.vue";

// 文件名即外观编号，未声明专属组件时复用默认外观。
export const userAppearanceRegistry = createFileAppearanceRegistry(
  import.meta.glob<Component>("./themes/*.vue", { eager: true, import: "default" }),
  DefaultAppearance,
);

/** 解析个人信息模块实际使用的外观组件：主题未登记时回退默认外观 */
export const resolveUserAppearance = (themeId: unknown) => userAppearanceRegistry.resolve(themeId);
