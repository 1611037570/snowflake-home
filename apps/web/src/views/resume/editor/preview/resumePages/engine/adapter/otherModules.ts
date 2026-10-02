import { getValidData, getValidDataEntries } from "../../../shared/validData";
import type { LayoutNode } from "../types";
import type { LayoutAdapter, LayoutAdapterContext, LayoutAdapterRegistry } from "./index";
import { createExperienceModuleAdapter } from "./experienceModules";
import { hasThemeSlogan } from "@/views/resume/theme/components/regionContainer/registry";

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
      breakPolicy: {},
      payload: { moduleKey: "user" },
    },
  ];
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
      breakPolicy: {},
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
      breakPolicy: {},
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
      breakPolicy: {},
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
  registry.register("slogan", createSloganModuleAdapter);
  LIST_MODULE_KEYS.forEach((moduleKey) => {
    registry.register(moduleKey, createListModuleAdapter(moduleKey));
  });
  MEDIA_MODULE_KEYS.forEach((moduleKey) => {
    registry.register(moduleKey, createMediaModuleAdapter(moduleKey));
  });
  registry.registerFallback(createCustomModuleFallback);
};
