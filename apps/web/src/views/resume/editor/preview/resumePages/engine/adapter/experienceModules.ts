import { getValidDataEntries, isContentEmpty } from "@/views/resume/shared/validData";
import type { LayoutAdapter, LayoutAdapterContext, LayoutAdapterRegistry } from "./index";
import { parseRichText } from "./richTextParser";

/** 当前使用统一经历列表结构的模块 key */
export const EXPERIENCE_MODULE_KEYS = ["work", "internship", "project", "education", "club", "volunteer"] as const;

/** 经历模块统一使用详情组件：教育展示学院、专业、学历与学制，其余模块展示职务与部门。 */
const EXPERIENCE_CONTENT_KIND = "experienceDetails";

/** 读取经历模块中的有效条目 */
const getExperienceItems = (context: LayoutAdapterContext) => {
  const moduleData = context.data[context.moduleKey];
  if (!moduleData || typeof moduleData !== "object") return [];

  const list = (moduleData as { list?: unknown }).list;
  return getValidDataEntries(list) as Array<{ data: Record<string, unknown>; index: number }>;
};

/** 创建经历条目，全部经历模块共用详情组件展示各自字段。 */
export const createExperienceModuleAdapter = (moduleKey: string): LayoutAdapter => (
  context,
) => {
  const items = getExperienceItems({ ...context, moduleKey });

  return items.map(({ data: item, index }) => {
    const content = typeof item.content === "string" ? item.content : "";
    // 条目正文参与分片：断点与首段截取共用同一份解析结果
    const parsed = isContentEmpty(content) ? undefined : parseRichText(content);

    return {
      id: `${moduleKey}.item-${index}`,
      sourceModuleKey: moduleKey,
      sourceItemIndex: index,
      type: "group",
      contentKind: EXPERIENCE_CONTENT_KIND, // 全部经历模块共用同一详情组件。
      payload: {
        part: "item",
        item,
        // 志愿服务展示服务时长，其余经历展示职务与部门
        inlineInfo: moduleKey === "volunteer" ? [item.duration] : [item.post, item.department],
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
