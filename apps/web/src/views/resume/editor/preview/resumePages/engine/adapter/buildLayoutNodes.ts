import type { LayoutNode } from "../types";
import {
  createLayoutAdapterRegistry,
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
    return adapter({ moduleKey, data, ui, config });
  });
