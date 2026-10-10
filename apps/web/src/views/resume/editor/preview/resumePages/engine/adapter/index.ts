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

/** 模块装配规则只在适配器注册处声明，新增模块默认沿用公共规则。 */
export interface ModuleAssemblyPolicy {
  title: boolean; // 是否在内容之前生成模块标题
  paragraphSpacing: boolean; // 是否为每条内容生成公共段间距
}

const DEFAULT_ASSEMBLY_POLICY: ModuleAssemblyPolicy = {
  title: true, // 普通模块保留标题
  paragraphSpacing: true, // 普通内容共用段间距
};

/** 创建模块标题节点：标题独立成行参与分页，能放下就留在当前页，放不下与后续内容一起顺延 */
export const createModuleTitleNode = (moduleKey: string): LayoutNode => ({
  id: `${moduleKey}.title`,
  sourceModuleKey: moduleKey,
  type: "title",
  payload: { moduleKey },
});

/** 判断节点是否为模块标题节点 */
export const isModuleTitleNode = (node: LayoutNode): boolean =>
  node.type === "title" && typeof (node.payload as { moduleKey?: unknown } | null)?.moduleKey === "string";

/** 排版适配器注册表 */
export interface LayoutAdapterRegistry {
  /** 注册指定模块 key 的适配器 */
  register(moduleKey: string, adapter: LayoutAdapter, policy?: Partial<ModuleAssemblyPolicy>): void;
  /** 注册没有精确匹配时使用的兜底适配器 */
  registerFallback(adapter: LayoutAdapter): void;
  /** 根据模块 key 获取适配器 */
  resolve(moduleKey: string): LayoutAdapter | undefined;
  /** 读取模块装配规则，未声明的模块沿用公共默认值 */
  resolvePolicy(moduleKey: string): ModuleAssemblyPolicy;
}

/**
 * 创建排版适配器注册表。
 * 模块路由只负责选择适配器，不负责分页和页面布局分配。
 */
export const createLayoutAdapterRegistry = (
  adapters: Record<string, LayoutAdapter> = {},
): LayoutAdapterRegistry => {
  const adapterMap = new Map(Object.entries(adapters));
  const policyMap = new Map<string, ModuleAssemblyPolicy>(); // 模块声明的标题与段间距规则
  let fallbackAdapter: LayoutAdapter | undefined;

  return {
    register(moduleKey, adapter, policy) {
      adapterMap.set(moduleKey, adapter);
      policyMap.set(moduleKey, { ...DEFAULT_ASSEMBLY_POLICY, ...policy });
    },
    registerFallback(adapter) {
      fallbackAdapter = adapter;
    },
    resolve(moduleKey) {
      return adapterMap.get(moduleKey) || fallbackAdapter;
    },
    resolvePolicy(moduleKey) {
      return policyMap.get(moduleKey) ?? DEFAULT_ASSEMBLY_POLICY;
    },
  };
};
