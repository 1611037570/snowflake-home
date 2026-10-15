import { isContentEmpty, getValidDataEntries } from "../../../shared/validData";
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

/** 读取技能模块数据：正文与技能条目共存，由模块 ui.layout 决定渲染哪一种 */
const getSkillModuleData = (context: LayoutAdapterContext) => {
  const moduleData = context.data[context.moduleKey];
  if (!moduleData || typeof moduleData !== "object") return null;
  return moduleData as { ui?: { layout?: unknown /* 技能展示形式 */, skillColumns?: unknown /* 熟练度预览列数 */, skillStyle?: unknown /* 熟练度展示样式 */ }; data?: { content?: unknown }; list?: unknown };
};

// 技能样式白名单，非法取值回退进度条
const SKILL_STYLES = new Set(["bar", "dot", "score"]);

/** 创建技能模块适配器：熟练度布局渲染技能条目列表，其余布局沿用富文本正文 */
export const createSkillModuleAdapter = (moduleKey: string): LayoutAdapter => (
  context,
) => {
  const moduleData = getSkillModuleData(context);
  if (!moduleData) return [];

  // 熟练度布局按列数组成整行节点，分页时保持同一行的技能在一起。
  if (moduleData.ui?.layout === "proficiency") {
    const requestedColumns = Number(moduleData.ui.skillColumns);
    const columns = requestedColumns === 2 || requestedColumns === 3 ? requestedColumns : 1;
    // 样式取值经白名单校验后下发给正文组件
    const requestedStyle = String(moduleData.ui.skillStyle ?? "");
    const skillStyle = SKILL_STYLES.has(requestedStyle) ? requestedStyle : "bar";
    const entries = getValidDataEntries(moduleData.list);
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
          skillStyle, // 当前行使用的熟练度样式。
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
