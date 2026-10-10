import type { Component } from "vue";
import type { RegionPadding } from "../regionPadding";
import type { ThemeSettingRestrictions } from "../settingCapabilities";

/** 外观能力统一声明，解析器直接读取组件元数据。 */
export type AppearanceComponent = Component & {
  regionPadding?: RegionPadding | ((ui?: Record<string, any>) => RegionPadding); // 区域内部装饰空间
  fillsPageTop?: boolean; // 首页区域是否覆盖纸张顶边
  gapBefore?: number; // 区域前置间距覆盖值
  usesDateRail?: boolean; // 条目是否使用左侧日期栏
  unsupportedSettings?: ThemeSettingRestrictions; // 不支持的用户设置及原因
};

/** 外观注册表：按编号取组件，未知编号一律回退 default */
export interface AppearanceRegistry {
  /** 已登记的外观组件，键为外观编号 */
  components: Record<string, AppearanceComponent> & { default: AppearanceComponent };
  /** 解析外观组件：传入主题编号或外观编号，未登记时返回 default */
  resolve: (id: unknown) => AppearanceComponent;
}

/**
 * 创建外观注册表。
 * 必须包含 default 组件：未登记的编号与未知取值都走它，保证新增主题不会因为缺外观而空白。
 * @param components 编号 → 组件
 */
export const createAppearanceRegistry = (
  components: Record<string, AppearanceComponent> & { default: AppearanceComponent },
): AppearanceRegistry => ({
  components,
  resolve: (id) => {
    const appearanceId = typeof id === "string" ? id : "";
    // 默认组件在类型中保证存在，未登记的外观统一回退。
    return components[appearanceId] || components.default;
  },
});

/** 外观按文件名登记，只需提供各槽位的默认组件。 */
export const createFileAppearanceRegistry = (
  modules: Record<string, Component>,
  defaultComponent: Component,
): AppearanceRegistry => createAppearanceRegistry({
  ...Object.fromEntries(Object.entries(modules).map(([path, component]) => [
    path.slice(path.lastIndexOf("/") + 1, -".vue".length),
    component,
  ])),
  default: defaultComponent, // 当前槽位的默认外观
});
