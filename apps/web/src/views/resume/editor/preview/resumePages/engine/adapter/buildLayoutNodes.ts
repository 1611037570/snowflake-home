import type { LayoutNode } from "../types";
import {
  createLayoutAdapterRegistry,
  createModuleTitleNode,
  type LayoutAdapterRegistry,
} from "./index";
import { registerExperienceModuleAdapters } from "./experienceModules";
import { registerOtherModuleAdapters } from "./otherModules";
import { registerRichTextModuleAdapters } from "./richTextModules";
import { hasThemeSlogan } from "@/views/resume/theme/components/regionContainer/registry";

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

/**
 * 在模块每个内容条目前插入段间距节点。
 * 间距与标题一样是独立节点：能放进当前页就留在这页，放不下与后面的内容一起顺延，
 * 成为新页第一项时由 hideWhenPageLeading 隐藏占位，因此分页层不需要为它单独判断。
 */
const addParagraphSpacingRows = (nodes: LayoutNode[], height: number): LayoutNode[] => {
  const first = nodes[0];
  if (!first || height <= 0 || !usesParagraphSpacing(first.sourceModuleKey)) return nodes;
  // 每个条目独立保留段间距，避免同一模块的后续条目紧贴前一条目。
  return nodes.flatMap((node) => {
    const spacer: LayoutNode = {
      /** 间距节点唯一编号 */
      id: `${node.id}.paragraph-spacing`,
      /** 间距所属模块 */
      sourceModuleKey: node.sourceModuleKey,
      /** 独立间距节点类型 */
      type: "spacer",
      /** 沿用普通节点分页规则 */
      breakPolicy: {},
      /** 后续页面首位隐藏间距 */
      hideWhenPageLeading: true,
      /** 间距渲染载荷 */
      payload: { height /* 间距高度 */ },
    };
    return [spacer, node];
  });
};

/** 创建内置简历模块适配器注册表。 */
export const createResumeLayoutAdapterRegistry = (): LayoutAdapterRegistry => {
  const registry = createLayoutAdapterRegistry();
  registerRichTextModuleAdapters(registry);
  registerExperienceModuleAdapters(registry);
  registerOtherModuleAdapters(registry);
  return registry;
};

/** 不渲染模块标题的模块：个人信息与顶部标语由外观自带标题排版 */
const NO_MODULE_TITLE_KEYS = new Set(["user", "slogan"]);

/** 把模块标题作为独立节点插到模块最前：标题与模块内容之间不插入模块间距，由同一模块 key 保证 */
const insertModuleTitle = (moduleKey: string, nodes: LayoutNode[]): LayoutNode[] =>
  NO_MODULE_TITLE_KEYS.has(moduleKey) ? nodes : [createModuleTitleNode(moduleKey), ...nodes];

/** 上一轮生成的节点与签名，用于复用内容未变的节点对象 */
let lastNodesById = new Map<string, LayoutNode>();
let lastSignatures = new Map<string, string>();

/**
 * 节点内容签名：只覆盖渲染读取的字段。
 * 载荷与断点由富文本解析缓存保证同内容同引用，因此同一节点在内容未变时签名一致。
 */
const createNodeSignature = (node: LayoutNode): string =>
  JSON.stringify([
    node.type,
    node.sourceModuleKey,
    Boolean(node.hideWhenPageLeading),
    node.breakPolicy?.minHeight ?? 0,
    node.payload,
    node.breakPoints ?? [],
  ]);

/** 复用上一轮结果里内容未变的节点对象，避免输入时整棵测量树重渲染 */
const reuseUnchangedNodes = (
  nextNodes: LayoutNode[],
  previousNodes: Map<string, LayoutNode>,
  previousSignatures: Map<string, string>,
): { nodes: LayoutNode[]; signatures: Map<string, string> } => {
  const signatures = new Map<string, string>();
  const nodes = nextNodes.map((node) => {
    const signature = createNodeSignature(node);
    signatures.set(node.id, signature);
    const previous = previousNodes.get(node.id);
    return previous && previousSignatures.get(node.id) === signature ? previous : node;
  });
  return { nodes, signatures };
};

/**
 * 按页面配置顺序生成排版节点。
 * 适配器只处理业务数据到语义节点的转换，不决定节点进入哪一栏；模块标题作为独立节点排在模块最前。
 * 输出保持节点对象标识：内容未变的节点复用上一轮对象，让渲染层按引用跳过比对。
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
}): LayoutNode[] => {
  // 主题编号对应内置标语组件时自动生成标语节点，无需简历配置额外提供模块。
  const themeSlogan = hasThemeSlogan((ui as any)?.theme?.template);
  const effectiveModuleKeys = themeSlogan && !moduleKeys.includes("slogan")
    ? ["slogan", ...moduleKeys]
    : moduleKeys;
  const nextNodes = effectiveModuleKeys.flatMap((moduleKey) => {
    const adapter = registry.resolve(moduleKey);
    if (!adapter) return [];
    const nodes = adapter({ moduleKey, data, ui, config });
    const spacing = Number((ui as any)?.page?.spacing?.paragraph);
    if (nodes.length === 0 && !NO_MODULE_TITLE_KEYS.has(moduleKey)) {
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

  const reused = reuseUnchangedNodes(nextNodes, lastNodesById, lastSignatures);
  lastNodesById = new Map(reused.nodes.map((node) => [node.id, node]));
  lastSignatures = reused.signatures;
  return reused.nodes;
};
