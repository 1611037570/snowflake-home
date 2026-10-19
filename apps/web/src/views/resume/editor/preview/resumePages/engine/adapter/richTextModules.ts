import { isContentEmpty, getValidDataEntries } from "@/views/resume/shared/validData";
import {
  createModuleTitleNode,
  type LayoutAdapter,
  type LayoutAdapterContext,
  type LayoutAdapterRegistry,
} from "./index";
import { parseRichText } from "./richTextParser";

/** 当前使用通用富文本模块渲染的模块 key（skill 支持切换熟练度布局，适配器单独注册） */
export const RICH_TEXT_MODULE_KEYS = ["advantage"] as const;

/** 读取富文本模块中的正文内容 */
const getModuleContent = (context: LayoutAdapterContext): string => {
  const moduleData = context.data[context.moduleKey];
  if (!moduleData || typeof moduleData !== "object") return "";
  const content = (moduleData as { data?: { content?: unknown } }).data?.content;
  return typeof content === "string" && !isContentEmpty(content) ? content : "";
};

/** 创建 advantage 模块共用的富文本适配器 */
export const createRichTextModuleAdapter = (moduleKey: string): LayoutAdapter => (
  context,
) => {
  const content = getModuleContent({ ...context, moduleKey });
  if (!content) return [];

  const parsed = parseRichText(content);
  const title = createModuleTitleNode(moduleKey);

  return [
    {
      id: `${moduleKey}.content`,
      sourceModuleKey: moduleKey,
      type: "richText",
      payload: parsed,
      title,
      breakPoints: parsed.breakPoints,
    },
  ];
};

/** 读取技能模块数据：正文与技能条目共存，由简历 ui.skill.layout 决定渲染哪一种 */
const getSkillModuleData = (context: LayoutAdapterContext) => {
  const moduleData = context.data[context.moduleKey];
  if (!moduleData || typeof moduleData !== "object") return null;
  return moduleData as { data?: { content?: unknown }; list?: unknown };
};

/** 创建技能模块适配器：熟练度布局渲染技能条目列表，其余布局沿用富文本正文 */
export const createSkillModuleAdapter = (moduleKey: string): LayoutAdapter => (
  context,
) => {
  const moduleData = getSkillModuleData(context);
  if (!moduleData) return [];
  const skillUi = context.ui?.skill as { layout?: string /* 技能布局 */, columns?: number /* 熟练度列数 */ } | undefined;
  const themeUi = context.ui?.theme as { skillTemplate?: string /* 技能模板编号 */ } | undefined;

  // 熟练度布局按列数组成整行节点，分页时保持同一行的技能在一起。
  if (skillUi?.layout === "proficiency") {
    const requestedColumns = Number(skillUi.columns);
    const columns = requestedColumns === 2 || requestedColumns === 3 ? requestedColumns : 1;
    // 模板编号随节点传入公共技能组件，预览与菜单使用同一实现。
    const skillTemplate = themeUi?.skillTemplate || "none";
    const entries = getValidDataEntries(moduleData.list);
    // 占比与标签类样式把全部可见技能作为一组，保证比例统一或标签自然换行。
    if (["distribution", "tag", "notion", "rainbowTag"].includes(skillTemplate) && entries.length) {
      return [{
        id: `${moduleKey}.${skillTemplate}`,
        sourceModuleKey: moduleKey,
        sourceItemIndex: entries[0].index,
        type: "block" as const,
        contentKind: moduleKey,
        payload: {
          part: "item" as const, // 占比或标签类样式的整组内容。
          item: entries[0].data, // 保留当前条目载荷。
          items: entries.map(({ data }) => data), // 参与占比计算或标签类展示的可见技能。
          skillTemplate, // 占比或标签类模板编号。
        },
      }];
    }
    const rows = [];
    for (let offset = 0; offset < entries.length; offset += columns) {
      const row = entries.slice(offset, offset + columns);
      rows.push({
        id: `${moduleKey}.item-${row[0].index}`,
        sourceModuleKey: moduleKey,
        sourceItemIndex: row[0].index,
        type: "block" as const,
        contentKind: moduleKey,
        payload: {
          part: "item" as const, // 技能列表条目。
          item: row[0].data, // 单栏及主题覆盖沿用首个条目。
          items: row.map(({ data }) => data), // 同行展示的技能条目。
          columns, // 当前行使用的列数。
          skillTemplate, // 当前行使用的技能模板编号。
        },
      });
    }
    return rows;
  }

  // 富文本布局：与 advantage 等通用正文模块一致
  const content = getModuleContent(context);
  if (!content) return [];

  const parsed = parseRichText(content);
  const title = createModuleTitleNode(moduleKey);

  return [
    {
      id: `${moduleKey}.content`,
      sourceModuleKey: moduleKey,
      type: "richText",
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
  // 技能模块支持布局切换，注册双模式适配器
  registry.register("skill", createSkillModuleAdapter("skill"));
};
