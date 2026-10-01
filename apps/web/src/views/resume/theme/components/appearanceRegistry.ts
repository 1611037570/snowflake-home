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
 * 主题编号与外观编号同名时不需要别名表；需要把主题编号映射到别名的外观时传 aliases。
 * 必须包含 default 组件，未登记的主题与未知编号都走它，保证新增主题不会因为缺外观而空白。
 * @param components 外观编号 → 组件
 * @param aliases 主题编号 → 外观编号的映射，未登记的主题直接使用 default
 */
export const createAppearanceRegistry = (
  components: Record<string, Component>,
  aliases: Record<string, string> = {},
): AppearanceRegistry => ({
  components,
  resolve: (id) => {
    const appearanceId = typeof id === "string" ? aliases[id] || id : "";
    // 注册表契约要求包含 default，这里按契约收窄类型
    return (components[appearanceId] || components.default) as Component;
  },
});
