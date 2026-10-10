import { getValidDataEntries, isContentEmpty } from "../../../shared/validData";
import type { LayoutAdapter, LayoutAdapterContext, LayoutAdapterRegistry } from "./index";
import { parseRichText } from "./richTextParser";

/** 学术成果模块 key：条目字段与经历类模块不同，使用独立适配器与独立渲染分支 */
export const ACADEMIC_MODULE_KEYS = ["publication", "ip"] as const;

/** 读取学术成果模块中的有效条目 */
const getAcademicItems = (context: LayoutAdapterContext) => {
  const moduleData = context.data[context.moduleKey];
  if (!moduleData || typeof moduleData !== "object") return [];

  const list = (moduleData as { list?: unknown }).list;
  return getValidDataEntries(list) as Array<{ data: Record<string, unknown>; index: number }>;
};

/** 创建学术成果条目的排版适配器：标题行、署名行、载体行与正文各自成块参与分页 */
export const createAcademicModuleAdapter = (moduleKey: string): LayoutAdapter => (context) => {
  const items = getAcademicItems({ ...context, moduleKey });

  return items.map(({ data: item, index }) => {
    const content = typeof item.content === "string" ? item.content : "";
    // 正文参与分片：断点与首段截取共用同一份解析结果
    const parsed = isContentEmpty(content) ? undefined : parseRichText(content);

    return {
      id: `${moduleKey}.item-${index}`,
      sourceModuleKey: moduleKey,
      sourceItemIndex: index,
      type: "group" as const,
      payload: {
        part: "item",
        item,
        content: parsed,
      },
      // 正文起点也作为断点：放不下正文时允许条目头留在当前页，正文顺延到下一页
      breakPoints: parsed
        ? [{ offset: 0, type: "paragraph" as const }, ...parsed.breakPoints]
        : undefined,
    };
  });
};

/** 将学术论文与知识产权模块适配器注册到注册表 */
export const registerAcademicModuleAdapters = (registry: LayoutAdapterRegistry) => {
  ACADEMIC_MODULE_KEYS.forEach((moduleKey) => {
    registry.register(moduleKey, createAcademicModuleAdapter(moduleKey));
  });
};
