import { getValidData, isContentEmpty } from "../../../modules/validData";
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

/** 创建工作、项目、教育经历共用的条目适配器 */
export const createExperienceModuleAdapter = (moduleKey: string): LayoutAdapter => (
  context,
) => {
  const items = getExperienceItems({ ...context, moduleKey });

  return items.map((item, index) => {
    const content = typeof item.content === "string" ? item.content : "";
    // 条目正文参与分片：断点与首段截取共用同一份解析结果
    const parsed = isContentEmpty(content) ? undefined : parseRichText(content);

    return {
      id: `${moduleKey}.item-${index}`,
      sourceModuleKey: moduleKey,
      type: "group",
      breakPolicy: {
        // 有正文的条目按正文断点拆分，头部随首段一起留在原页
        splittable: Boolean(parsed),
      },
      payload: {
        part: "item",
        item,
        content: parsed,
      },
      // 正文起点也作为断点：放不下正文时允许“标题 + 条目头”留在当前页，正文顺延到下一页
      breakPoints: parsed
        ? [{ offset: 0, type: "paragraph" as const }, ...parsed.breakPoints]
        : undefined,
    };
  });
};

/** 将经历模块适配器注册到注册表 */
export const registerExperienceModuleAdapters = (registry: LayoutAdapterRegistry) => {
  EXPERIENCE_MODULE_KEYS.forEach((moduleKey) => {
    registry.register(moduleKey, createExperienceModuleAdapter(moduleKey));
  });
};
