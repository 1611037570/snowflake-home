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

/** 把模块标题作为独立节点插到模块最前：标题与模块内容之间不插入模块间距，由同一模块 key 保证 */
const insertModuleTitle = (moduleKey: string, nodes: LayoutNode[]): LayoutNode[] =>
  moduleKey === "user" ? nodes : [createModuleTitleNode(moduleKey), ...nodes];

/**
 * 按页面配置顺序生成排版节点。
 * 适配器只处理业务数据到语义节点的转换，不决定节点进入哪一栏；模块标题作为独立节点排在模块最前。
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
    const spacing = Number((ui as any)?.page?.spacing?.paragraph);
    if (nodes.length === 0 && moduleKey !== "user") {
      // 空模块保留零高占位与标题，避免模块无内容时标题从预览中消失。
      return [
        createModuleTitleNode(moduleKey),
        {
          id: `${moduleKey}.title-only`,
          sourceModuleKey: moduleKey,
          type: "spacer",
          breakPolicy: {},
          hideWhenPageLeading: true,
          payload: { height: 0 },
        },
      ];
    }
    return insertModuleTitle(
      moduleKey,
      addParagraphSpacingRows(nodes, Number.isFinite(spacing) ? Math.max(0, spacing) : 0),
    );
  });
