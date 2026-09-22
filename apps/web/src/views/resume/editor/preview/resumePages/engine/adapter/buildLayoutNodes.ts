import type { LayoutNode } from "../types";
import {
  createLayoutAdapterRegistry,
  createModuleTitleNode,
  type LayoutAdapterRegistry,
} from "./index";
import { registerExperienceModuleAdapters } from "./experienceModules";
import { registerOtherModuleAdapters } from "./otherModules";
import { registerRichTextModuleAdapters } from "./richTextModules";

/** 创建内置简历模块适配器注册表。 */
export const createResumeLayoutAdapterRegistry = (): LayoutAdapterRegistry => {
  const registry = createLayoutAdapterRegistry();
  registerRichTextModuleAdapters(registry);
  registerExperienceModuleAdapters(registry);
  registerOtherModuleAdapters(registry);
  return registry;
};

/** 标题只在模块首个分片渲染，挂到首个节点上让分页计入标题高度；个人信息模块没有标题 */
const attachModuleTitle = (moduleKey: string, nodes: LayoutNode[]): LayoutNode[] => {
  const first = nodes[0];
  if (!first || moduleKey === "user" || first.title) return nodes;
  return [
    {
      ...first,
      title: createModuleTitleNode(moduleKey),
      breakPolicy: { ...first.breakPolicy, keepTitleWithFirst: true },
    },
    ...nodes.slice(1),
  ];
};

/**
 * 按页面配置顺序生成排版节点。
 * 适配器只处理业务数据到语义节点的转换，不决定节点进入哪一栏。
 */
export const buildLayoutNodes = ({
  moduleKeys,
  data,
  ui,
  config,
  registry = createResumeLayoutAdapterRegistry(),
}: {
  moduleKeys: string[];
  data: Record<string, unknown>;
  ui?: Record<string, unknown>;
  config?: unknown;
  registry?: LayoutAdapterRegistry;
}): LayoutNode[] =>
  moduleKeys.flatMap((moduleKey) => {
    const adapter = registry.resolve(moduleKey);
    if (!adapter) return [];
    return attachModuleTitle(moduleKey, adapter({ moduleKey, data, ui, config }));
  });
