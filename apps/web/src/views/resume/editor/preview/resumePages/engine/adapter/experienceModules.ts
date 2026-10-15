import { getValidDataEntries, isContentEmpty } from "../../../shared/validData";
import type { LayoutAdapter, LayoutAdapterContext, LayoutAdapterRegistry } from "./index";
import { parseRichText } from "./richTextParser";

/** 当前使用统一经历列表结构的模块 key */
export const EXPERIENCE_MODULE_KEYS = ["work", "internship", "project", "education", "club", "volunteer", "training"] as const;

/** 工作、教育和项目使用同一经历详情组件，其余经历使用通用组件。 */
const EXPERIENCE_CONTENT_KINDS: Record<string, string> = {
  education: "experienceDetails", // 教育经历展示学院、专业、成绩、学历与学制。
  work: "experienceDetails", // 工作经历展示岗位与部门。
  project: "experienceDetails", // 项目经历展示岗位与部门。
};

/** 读取经历模块中的有效条目 */
const getExperienceItems = (context: LayoutAdapterContext) => {
  const moduleData = context.data[context.moduleKey];
  if (!moduleData || typeof moduleData !== "object") return [];

  const list = (moduleData as { list?: unknown }).list;
  return getValidDataEntries(list) as Array<{ data: Record<string, unknown>; index: number }>;
};

/** 创建经历条目，工作、教育与项目共用详情组件展示各自字段。 */
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
      contentKind: EXPERIENCE_CONTENT_KINDS[moduleKey] ?? "experience", // 三类主要经历共用详情组件。
      payload: {
        part: "item",
        item,
        inlineInfo: [item.post, item.department], // 职务与部门作为并列信息
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
