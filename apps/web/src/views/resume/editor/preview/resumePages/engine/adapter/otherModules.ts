import { getValidData, getValidDataEntries } from "../../../shared/validData";
import type { LayoutNode } from "../types";
import type { LayoutAdapter, LayoutAdapterContext, LayoutAdapterRegistry } from "./index";
import { createExperienceModuleAdapter } from "./experienceModules";
import { hasThemeSlogan } from "@/views/resume/theme/components/sloganModule/registry";
import { getPreviewText } from "../../../shared/i18n";
import dayjs from "dayjs";

/** 需要使用通用条目块结构的模块 key */
const LIST_MODULE_KEYS = ["account", "honor"] as const;

/** 需要使用不可拆分媒体结构的模块 key */
const MEDIA_MODULE_KEYS = ["image", "video"] as const;

/** 创建个人信息模块适配器 */
const createUserModuleAdapter = (context: LayoutAdapterContext): LayoutNode[] => {
  const moduleData = context.data.user;
  const userData = getValidData((moduleData as { data?: unknown })?.data);
  if (!userData || typeof userData !== "object" || Array.isArray(userData)) return [];

  const hasUserField = Object.values(userData as Record<string, unknown>).some(
    (value) => value !== undefined && value !== null && value !== "",
  );
  if (!hasUserField) return [];

  return [
    {
      id: "user",
      sourceModuleKey: "user",
      type: "group",
      payload: { moduleKey: "user" },
    },
  ];
};

/** 从个人资料派生左栏求职信息，逐行生成普通节点以沿用现有分页。 */
const createUserFactsAdapter = (context: LayoutAdapterContext): LayoutNode[] => {
  const userModule = context.data.user as { data?: Record<string, unknown>; ui?: Record<string, any> } | undefined;
  const user = userModule?.data || {};
  const lang = String((context.ui as any)?.content?.language || "zh");
  const visible = (key: string) => userModule?.ui?.[key]?.hidden !== true && user[key];
  const facts: Array<{ key: string; value: string }> = [];
  if (visible("status")) facts.push({ key: "status", value: String(user.status) });
  if (visible("workTime") && dayjs(String(user.workTime)).isValid()) {
    const years = Math.max(0, Math.floor((dayjs().diff(dayjs(String(user.workTime)), "month") + 7) / 12));
    if (years > 0) facts.push({ key: "workTime", value: `${getPreviewText("expYearsLabel", lang)}${getPreviewText("expYears", lang, { years })}` });
  }
  if (visible("position")) facts.push({ key: "position", value: `${getPreviewText("positionLabel", lang)}${user.position}` });
  if (visible("salary")) facts.push({ key: "salary", value: `${getPreviewText("salaryLabel", lang)}${user.salary}` });
  return facts.map((fact) => ({
    id: `userFacts.${fact.key}`, // 求职信息行的稳定编号
    sourceModuleKey: "userFacts", // 派生模块编号
    type: "block", // 按普通文本行参与分页
    payload: { value: fact.value }, // 当前字段的显示文案
  }));
};

/** 创建顶部标语模块适配器 */
const createSloganModuleAdapter = (context: LayoutAdapterContext): LayoutNode[] => {
  const moduleData = context.data.slogan;
  const sloganData = getValidData((moduleData as { data?: unknown })?.data);
  // 主题自带的标语不依赖用户数据；普通内容模板仍按已有标语字段判断。
  const builtInSlogan = hasThemeSlogan((context.ui as any)?.theme?.template);
  const hasSloganField =
    sloganData && typeof sloganData === "object" && !Array.isArray(sloganData) &&
    Object.values(sloganData as Record<string, unknown>).some(
      (value) => value !== undefined && value !== null && value !== "",
    );
  if (!builtInSlogan && !hasSloganField) return [];

  return [
    {
      id: "slogan",
      sourceModuleKey: "slogan",
      type: "group",
      payload: { moduleKey: "slogan" },
    },
  ];
};

/** 创建账号、荣誉等普通列表模块适配器 */
const createListModuleAdapter =
  (moduleKey: string): LayoutAdapter =>
  (context) => {
    const moduleData = context.data[moduleKey];
    if (!moduleData || typeof moduleData !== "object") return [];
    const list = getValidDataEntries((moduleData as { list?: unknown }).list);

    return list.map(({ data: item, index }) => ({
      id: `${moduleKey}.item-${index}`,
      sourceModuleKey: moduleKey,
      sourceItemIndex: index,
      type: "block" as const,
      payload: {
        part: "item",
        item,
      },
    }));
  };

/** 创建图片、视频等媒体模块适配器 */
const createMediaModuleAdapter =
  (moduleKey: string): LayoutAdapter =>
  (context) => {
    const moduleData = context.data[moduleKey];
    if (!moduleData || typeof moduleData !== "object") return [];
    const list = getValidDataEntries((moduleData as { list?: unknown }).list);

    return list.map(({ data: item, index }) => ({
      id: `${moduleKey}.media-${index}`,
      sourceModuleKey: moduleKey,
      sourceItemIndex: index,
      type: "media" as const,
      payload: {
        mediaType: moduleKey,
        item,
      },
    }));
  };

/** 为未单独注册的自定义模块生成经历结构 */
const createCustomModuleFallback = (context: LayoutAdapterContext): LayoutNode[] => {
  if (!context.moduleKey.startsWith("custom_")) return [];
  return createExperienceModuleAdapter(context.moduleKey)(context);
};

/** 注册剩余内置模块和自定义模块适配器 */
export const registerOtherModuleAdapters = (registry: LayoutAdapterRegistry) => {
  registry.register("user", createUserModuleAdapter);
  registry.register("userFacts", createUserFactsAdapter);
  registry.register("slogan", createSloganModuleAdapter);
  LIST_MODULE_KEYS.forEach((moduleKey) => {
    registry.register(moduleKey, createListModuleAdapter(moduleKey));
  });
  MEDIA_MODULE_KEYS.forEach((moduleKey) => {
    registry.register(moduleKey, createMediaModuleAdapter(moduleKey));
  });
  registry.registerFallback(createCustomModuleFallback);
};
