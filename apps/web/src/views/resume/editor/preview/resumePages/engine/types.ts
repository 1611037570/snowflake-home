/**
 * 排版引擎使用的节点类型。
 * 分页引擎只处理这些通用节点，不感知具体业务模块。
 */
export type LayoutNodeType =
  | "group"
  | "block"
  | "richText"
  | "repeat"
  | "media"
  | "spacer";

/**
 * 节点的最小布局约束。
 */
export interface BreakPolicy {
  /** 当前节点允许的最小高度 */
  minHeight?: number;
}

/** 富文本内容中的可拆分断点类型 */
export type BreakPointType = "paragraph" | "listItem" | "textRange" | "char" | "block";

/**
 * 富文本内容中的可拆分位置。
 * 分页时优先使用语义断点，字符断点仅作为最后的兜底方案。
 */
export interface BreakPoint {
  /** 断点在富文本内容中的位置 */
  offset: number;
  /** 断点对应的语义类型 */
  type: BreakPointType;
}

/**
 * 统一的排版节点。
 * 模块适配器负责生成节点，分页引擎负责计算节点如何分片。
 */
export interface LayoutNode {
  /** 节点唯一编号，必须稳定，不能每次随机生成 */
  id: string;
  /** 节点所属的简历模块 key */
  sourceModuleKey: string;
  /** 数组型子模块在编辑区中的原始记录下标 */
  sourceItemIndex?: number;
  /** 节点类型 */
  type: LayoutNodeType;
  /** 当前节点的分页规则 */
  breakPolicy: BreakPolicy;
  /** 节点落在后续页面首位时隐藏自身占位 */
  hideWhenPageLeading?: boolean;
  /** 节点实际内容，由具体节点类型自行约定结构 */
  payload: unknown;
  /** 当前节点的标题，只在第一次分片中渲染 */
  title?: LayoutNode;
  /** 富文本节点使用的可拆分断点 */
  breakPoints?: BreakPoint[];
}
