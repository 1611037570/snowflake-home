import { getValidData } from "../../../modules/validData";
import type { LayoutNode } from "../types";
import type { LayoutAdapter, LayoutAdapterContext, LayoutAdapterRegistry } from "./index";
import { createExperienceModuleAdapter } from "./experienceModules";

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
      breakPolicy: {
        splittable: true,
      },
      payload: { moduleKey: "user" },
    },
  ];
};

/** 创建账号、荣誉等普通列表模块适配器 */
const createListModuleAdapter =
  (moduleKey: string): LayoutAdapter =>
  (context) => {
    const moduleData = context.data[moduleKey];
    if (!moduleData || typeof moduleData !== "object") return [];
    const list = getValidData((moduleData as { list?: unknown }).list);
    if (!Array.isArray(list)) return [];

    return list.map((item, index) => ({
      id: `${moduleKey}.item-${index}`,
      sourceModuleKey: moduleKey,
      type: "block" as const,
      breakPolicy: {
        splittable: false,
      },
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
    const list = getValidData((moduleData as { list?: unknown }).list);
    if (!Array.isArray(list)) return [];

    return list.map((item, index) => ({
      id: `${moduleKey}.media-${index}`,
      sourceModuleKey: moduleKey,
      type: "media" as const,
      breakPolicy: {
        splittable: true,
      },
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
  LIST_MODULE_KEYS.forEach((moduleKey) => {
    registry.register(moduleKey, createListModuleAdapter(moduleKey));
  });
  MEDIA_MODULE_KEYS.forEach((moduleKey) => {
    registry.register(moduleKey, createMediaModuleAdapter(moduleKey));
  });
  registry.registerFallback(createCustomModuleFallback);
};
