import type { Component } from "vue";

/** 外观注册表：按编号取组件，未知编号一律回退 default */
export interface AppearanceRegistry {
  /** 已登记的外观组件，键为外观编号 */
  components: Record<string, Component>;
  /** 解析外观组件：传入主题编号或外观编号，未登记时返回 default */
  resolve: (id: unknown) => Component;
}

/**
 * 创建外观注册表。
 * 必须包含 default 组件：未登记的编号与未知取值都走它，保证新增主题不会因为缺外观而空白。
 * @param components 编号 → 组件
 */
export const createAppearanceRegistry = (
  components: Record<string, Component>,
): AppearanceRegistry => ({
  components,
  resolve: (id) => {
    const appearanceId = typeof id === "string" ? id : "";
    // 注册表契约要求包含 default，这里按契约收窄类型
    return (components[appearanceId] || components.default) as Component;
  },
});
