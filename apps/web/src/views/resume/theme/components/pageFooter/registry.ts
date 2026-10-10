import type { Component } from "vue";
import { createFileAppearanceRegistry } from "../appearanceRegistry";
import DefaultFooter from "./themes/default.vue";

// 页尾外观沿用主题文件注册规则，公共页面继续拥有高度与定位。
const footerRegistry = createFileAppearanceRegistry(
  import.meta.glob<Component>("./themes/*.vue", { eager: true, import: "default" }),
  DefaultFooter,
);

export const resolvePageFooter = (themeId: string) => footerRegistry.resolve(themeId);
