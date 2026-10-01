import type { Component } from "vue";
import AcademicAppearance from "./themes/academic.vue";
import BusinessAppearance from "./themes/business.vue";
import ClassicAppearance from "./themes/classic.vue";
import CreativeAppearance from "./themes/creative.vue";
import DefaultAppearance from "./themes/default.vue";
import FreshAppearance from "./themes/fresh.vue";
import MinimalAppearance from "./themes/minimal.vue";
import SteadyAppearance from "./themes/steady.vue";
import VividAppearance from "./themes/vivid.vue";

/** 个人信息模块外观注册表：外观编号 → 组件。只做静态映射，保证测量时几何立即就绪。 */
export const userAppearanceRegistry: Record<string, Component> = {
  default: DefaultAppearance, // 不绘制任何装饰，未单独设计的主题都落到这里
  minimal: MinimalAppearance, // 内容水平居中
  classic: ClassicAppearance, // 底部留出一段间距
  academic: AcademicAppearance, // 内容居中并叠加双分隔线
  business: BusinessAppearance, // 浅色底托圆角块 + 左侧主题色竖条
  creative: CreativeAppearance, // 浅色底托圆角块 + 右侧主题色竖条
  fresh: FreshAppearance, // 大圆角浅色底托
  vivid: VividAppearance, // 浅色底托 + 主题色描边
  steady: SteadyAppearance, // 左侧主题色细竖条
};

/** 主题编号到外观编号的映射：未登记的主题统一使用默认外观。 */
export const userAppearanceByTheme: Record<string, string> = {
  minimal: "minimal",
  classic: "classic",
  academic: "academic",
  business: "business",
  creative: "creative",
  fresh: "fresh",
  vivid: "vivid",
  steady: "steady",
};

/** 解析个人信息模块实际使用的外观组件，主题未登记或外观编号未知时回退默认外观。 */
export const resolveUserAppearance = (themeId: string) => {
  const appearanceId = userAppearanceByTheme[themeId] || "default";
  return userAppearanceRegistry[appearanceId] || userAppearanceRegistry.default;
};
