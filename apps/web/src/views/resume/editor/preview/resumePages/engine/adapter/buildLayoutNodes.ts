import type { LayoutNode } from "../types";
import {
  createLayoutAdapterRegistry,
  createModuleTitleNode,
  type LayoutAdapterRegistry,
} from "./index";
import { registerExperienceModuleAdapters } from "./experienceModules";
import { registerOtherModuleAdapters } from "./otherModules";
import { registerRichTextModuleAdapters } from "./richTextModules";

const PARAGRAPH_SPACING_MODULE_KEYS = new Set([
  "skill",
  "advantage",
  "work",
  "project",
  "education",
  "account",
  "honor",
  "image",
  "video",
]);

/** 判断模块是否需要在内容前添加独立段间距行。 */
const usesParagraphSpacing = (moduleKey: string): boolean =>
  PARAGRAPH_SPACING_MODULE_KEYS.has(moduleKey) || moduleKey.startsWith("custom_");

/** 将段间距转换成独立分页行，交由通用分页逻辑按高度放置。 */
const addParagraphSpacingRows = (nodes: LayoutNode[], height: number): LayoutNode[] =>
  nodes.flatMap((node) => {
    if (!usesParagraphSpacing(node.sourceModuleKey) || height <= 0) return [node];
    const { title, ...contentNode } = node;
    return [
      {
        id: `${node.id}.paragraph-spacing`,
        sourceModuleKey: node.sourceModuleKey,
        type: "spacer",
        breakPolicy: {},
        hideWhenPageLeading: true,
        payload: { height },
        title,
      },
      contentNode,
    ];
  });

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
      breakPolicy: { ...first.breakPolicy },
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
    const nodes = adapter({ moduleKey, data, ui, config });
    const spacing = Number(ui?.paragraphSpacing);
    return attachModuleTitle(
      moduleKey,
      addParagraphSpacingRows(nodes, Number.isFinite(spacing) ? Math.max(0, spacing) : 0),
    );
  });
