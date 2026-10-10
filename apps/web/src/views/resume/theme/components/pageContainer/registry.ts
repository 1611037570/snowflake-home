import type { Component } from "vue";
import { createFileAppearanceRegistry } from "../appearanceRegistry";
import DefaultPattern from "./themes/default.vue";

// 文件名即外观编号，未声明专属组件时复用默认外观。
export const pageAppearanceRegistry = createFileAppearanceRegistry(
  import.meta.glob<Component>("./themes/*.vue", { eager: true, import: "default" }),
  DefaultPattern,
);

/** 解析页面外观组件 */
export const resolvePageAppearance = (appearanceId: unknown) =>
  pageAppearanceRegistry.resolve(appearanceId);
