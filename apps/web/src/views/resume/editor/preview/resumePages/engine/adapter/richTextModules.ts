import { isContentEmpty } from "../../../modules/validData";
import type { LayoutAdapter, LayoutAdapterContext, LayoutAdapterRegistry } from "./index";
import { parseRichText } from "./richTextParser";
import type { LayoutNode } from "../types";

/** 当前使用通用富文本模块渲染的模块 key */
export const RICH_TEXT_MODULE_KEYS = ["skill", "advantage"] as const;

/** 创建富文本模块的标题节点 */
const createTitleNode = (moduleKey: string): LayoutNode => ({
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

/** 读取富文本模块中的正文内容 */
const getModuleContent = (context: LayoutAdapterContext): string => {
  const moduleData = context.data[context.moduleKey];
  if (!moduleData || typeof moduleData !== "object") return "";
  const content = (moduleData as { data?: { content?: unknown } }).data?.content;
  return typeof content === "string" && !isContentEmpty(content) ? content : "";
};

/** 创建 skill、advantage 共用的富文本适配器 */
export const createRichTextModuleAdapter = (moduleKey: string): LayoutAdapter => (
  context,
) => {
  const content = getModuleContent({ ...context, moduleKey });
  if (!content) return [];

  const parsed = parseRichText(content);
  const title = createTitleNode(moduleKey);

  return [
    {
      id: `${moduleKey}.content`,
      sourceModuleKey: moduleKey,
      type: "richText",
      breakPolicy: {
        splittable: true,
        keepWithNext: false,
        keepTitleWithFirst: true,
      },
      payload: parsed,
      title,
      breakPoints: parsed.breakPoints,
    },
  ];
};

/** 将通用富文本模块适配器注册到注册表 */
export const registerRichTextModuleAdapters = (registry: LayoutAdapterRegistry) => {
  RICH_TEXT_MODULE_KEYS.forEach((moduleKey) => {
    registry.register(moduleKey, createRichTextModuleAdapter(moduleKey));
  });
};
