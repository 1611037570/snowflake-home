import { getValidData, isContentEmpty } from "../../../modules/validData";
import type { LayoutNode } from "../types";
import type { LayoutAdapter, LayoutAdapterContext, LayoutAdapterRegistry } from "./index";
import { parseRichText } from "./richTextParser";

/** 当前使用统一经历列表结构的模块 key */
export const EXPERIENCE_MODULE_KEYS = ["work", "project", "education"] as const;

/** 读取经历模块中的有效条目 */
const getExperienceItems = (context: LayoutAdapterContext): Record<string, unknown>[] => {
  const moduleData = context.data[context.moduleKey];
  if (!moduleData || typeof moduleData !== "object") return [];

  const list = (moduleData as { list?: unknown }).list;
  const validList = getValidData(list);
  return Array.isArray(validList) ? (validList as Record<string, unknown>[]) : [];
};

/** 创建经历条目的头部节点 */
const createExperienceHeader = (
  moduleKey: string,
  index: number,
  item: Record<string, unknown>,
): LayoutNode => ({
  id: `${moduleKey}.item-${index}.header`,
  sourceModuleKey: moduleKey,
  type: "block",
  breakPolicy: {
    splittable: false,
    keepWithNext: Boolean(item.content),
    keepTitleWithFirst: false,
  },
  payload: {
    part: "header",
    item,
  },
});

/** 创建经历条目的富文本描述节点 */
const createExperienceContent = (
  moduleKey: string,
  index: number,
  content: string,
): LayoutNode => {
  const parsed = parseRichText(content);
  return {
    id: `${moduleKey}.item-${index}.content`,
    sourceModuleKey: moduleKey,
    type: "richText",
    breakPolicy: {
      splittable: true,
      keepWithNext: false,
      keepTitleWithFirst: false,
    },
    payload: parsed,
    breakPoints: parsed.breakPoints,
  };
};

/** 创建工作、项目、教育经历共用的条目适配器 */
export const createExperienceModuleAdapter = (moduleKey: string): LayoutAdapter => (
  context,
) => {
  const items = getExperienceItems({ ...context, moduleKey });

  return items.map((item, index) => {
    const content = typeof item.content === "string" ? item.content : "";
    const children: LayoutNode[] = [createExperienceHeader(moduleKey, index, item)];
    if (!isContentEmpty(content)) {
      children.push(createExperienceContent(moduleKey, index, content));
    }

    return {
      id: `${moduleKey}.item-${index}`,
      sourceModuleKey: moduleKey,
      type: "group",
      breakPolicy: {
        splittable: true,
        keepWithNext: false,
        keepTitleWithFirst: false,
      },
      payload: {
        part: "item",
        item,
      },
      children,
    };
  });
};

/** 将经历模块适配器注册到注册表 */
export const registerExperienceModuleAdapters = (registry: LayoutAdapterRegistry) => {
  EXPERIENCE_MODULE_KEYS.forEach((moduleKey) => {
    registry.register(moduleKey, createExperienceModuleAdapter(moduleKey));
  });
};
