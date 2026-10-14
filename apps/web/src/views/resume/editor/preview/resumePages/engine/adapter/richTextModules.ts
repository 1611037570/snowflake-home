import { isContentEmpty, getValidDataEntries } from "../../../shared/validData";
import {
  createModuleTitleNode,
  type LayoutAdapter,
  type LayoutAdapterContext,
  type LayoutAdapterRegistry,
} from "./index";
import { parseRichText } from "./richTextParser";

/** 当前使用通用富文本模块渲染的模块 key（skill 支持切换熟练度布局，适配器单独注册） */
export const RICH_TEXT_MODULE_KEYS = ["advantage", "hobby"] as const;

/** 读取富文本模块中的正文内容 */
const getModuleContent = (context: LayoutAdapterContext): string => {
  const moduleData = context.data[context.moduleKey];
  if (!moduleData || typeof moduleData !== "object") return "";
  const content = (moduleData as { data?: { content?: unknown } }).data?.content;
  return typeof content === "string" && !isContentEmpty(content) ? content : "";
};

/** 创建 advantage、hobby 共用的富文本适配器 */
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

/** 读取技能模块数据：正文与技能条目共存，由模块 ui.layout 决定渲染哪一种 */
const getSkillModuleData = (context: LayoutAdapterContext) => {
  const moduleData = context.data[context.moduleKey];
  if (!moduleData || typeof moduleData !== "object") return null;
  return moduleData as { ui?: { layout?: unknown }; data?: { content?: unknown }; list?: unknown };
};

/** 创建技能模块适配器：熟练度布局渲染技能条目列表，其余布局沿用富文本正文 */
export const createSkillModuleAdapter = (moduleKey: string): LayoutAdapter => (
  context,
) => {
  const moduleData = getSkillModuleData(context);
  if (!moduleData) return [];

  // 熟练度布局：每条技能独立成块参与分页，档位与名称由语义组件渲染
  if (moduleData.ui?.layout === "proficiency") {
    return getValidDataEntries(moduleData.list).map(({ data: item, index }) => ({
      id: `${moduleKey}.item-${index}`,
      sourceModuleKey: moduleKey,
      sourceItemIndex: index,
      type: "block" as const,
      contentKind: moduleKey,
      payload: {
        part: "item" as const,
        item,
      },
    }));
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
