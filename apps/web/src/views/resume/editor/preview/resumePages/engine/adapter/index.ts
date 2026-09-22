import type { LayoutNode } from "../types";

/** 模块适配器生成节点时可以读取的上下文 */
export interface LayoutAdapterContext {
  /** 当前模块 key */
  moduleKey: string;
  /** 当前简历数据 */
  data: Record<string, unknown>;
  /** 当前模块配置 */
  config?: unknown;
  /** 当前简历的主题配置 */
  ui?: Record<string, unknown>;
}

/** 将一个业务模块转换为通用排版节点 */
export type LayoutAdapter = (context: LayoutAdapterContext) => LayoutNode[];

/** 创建模块标题节点：标题只随模块首个分片渲染，分页需要计入它的高度 */
export const createModuleTitleNode = (moduleKey: string): LayoutNode => ({
  id: `${moduleKey}.title`,
  sourceModuleKey: moduleKey,
  type: "block",
  breakPolicy: {
    splittable: false,
    keepWithNext: true,
    keepTitleWithFirst: false,
  },
  payload: { moduleKey },
});

/** 排版适配器注册表 */
export interface LayoutAdapterRegistry {
  /** 注册指定模块 key 的适配器 */
  register(moduleKey: string, adapter: LayoutAdapter): void;
  /** 注册没有精确匹配时使用的兜底适配器 */
  registerFallback(adapter: LayoutAdapter): void;
  /** 根据模块 key 获取适配器 */
  resolve(moduleKey: string): LayoutAdapter | undefined;
}

/**
 * 创建排版适配器注册表。
 * 模块路由只负责选择适配器，不负责分页和页面布局分配。
 */
export const createLayoutAdapterRegistry = (
  adapters: Record<string, LayoutAdapter> = {},
): LayoutAdapterRegistry => {
  const adapterMap = new Map(Object.entries(adapters));
  let fallbackAdapter: LayoutAdapter | undefined;

  return {
    register(moduleKey, adapter) {
      adapterMap.set(moduleKey, adapter);
    },
    registerFallback(adapter) {
      fallbackAdapter = adapter;
    },
    resolve(moduleKey) {
      return adapterMap.get(moduleKey) || fallbackAdapter;
    },
  };
};
