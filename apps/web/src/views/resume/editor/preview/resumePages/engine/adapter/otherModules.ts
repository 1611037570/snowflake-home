import { getValidData, getValidDataEntries, isContentEmpty } from "../../../shared/validData";
import type { LayoutNode } from "../types";
import type { LayoutAdapter, LayoutAdapterContext, LayoutAdapterRegistry } from "./index";
import { createExperienceModuleAdapter } from "./experienceModules";
import { parseRichText } from "./richTextParser";

/** 需要使用通用条目块结构的模块 key（荣誉已升级为可分片的描述条目） */
const LIST_MODULE_KEYS = ["account"] as const;

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
      contentKind: "user", // 个人信息内容语义
      payload: { moduleKey: "user" },
    },
  ];
};

/** 创建顶部标语模块适配器 */
const createSloganModuleAdapter = (context: LayoutAdapterContext): LayoutNode[] => {
  const moduleData = context.data.slogan;
  const sloganData = getValidData((moduleData as { data?: unknown })?.data);
  const hasSloganField =
    sloganData && typeof sloganData === "object" && !Array.isArray(sloganData) &&
    Object.values(sloganData as Record<string, unknown>).some(
      (value) => value !== undefined && value !== null && value !== "",
    );
  if (!hasSloganField) return [];

  return [
    {
      id: "slogan",
      sourceModuleKey: "slogan",
      type: "group",
      contentKind: "slogan", // 用户标语内容语义
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
      contentKind: moduleKey, // 账号与荣誉使用对应语义组件
      payload: {
        part: "item",
        item,
      },
    }));
  };

/** 创建带描述正文的条目模块适配器：名称行构成条目头，描述正文参与分片（荣誉、语言能力共用） */
const createDescribedItemModuleAdapter =
  (moduleKey: string): LayoutAdapter =>
  (context) => {
    const moduleData = context.data[moduleKey];
    if (!moduleData || typeof moduleData !== "object") return [];
    const list = getValidDataEntries((moduleData as { list?: unknown }).list);

    return list.map(({ data: item, index }) => {
      const content = typeof item.content === "string" ? item.content : "";
      // 描述正文参与分片：断点与首段截取共用同一份解析结果
      const parsed = isContentEmpty(content) ? undefined : parseRichText(content);

      return {
        id: `${moduleKey}.item-${index}`,
        sourceModuleKey: moduleKey,
        sourceItemIndex: index,
        type: "block" as const,
        contentKind: moduleKey,
        payload: {
          part: "item" as const,
          item,
          content: parsed,
        },
        // 正文起点也作为断点：放不下描述时允许名称行留在当前页，描述顺延到下一页
        breakPoints: parsed
          ? [{ offset: 0, type: "paragraph" as const }, ...parsed.breakPoints]
          : undefined,
      };
    });
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
      contentKind: moduleKey, // 图片与视频使用对应语义组件
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
  registry.register("user", createUserModuleAdapter, {
    title: false, // 个人信息组件自行展示姓名
    paragraphSpacing: false, // 页眉不插入条目段间距
  });
  registry.register("slogan", createSloganModuleAdapter, {
    title: false, // 用户标语没有独立模块标题
    paragraphSpacing: false, // 标语区域不插入条目段间距
  });
  LIST_MODULE_KEYS.forEach((moduleKey) => {
    registry.register(moduleKey, createListModuleAdapter(moduleKey));
  });
  // 荣誉与语言能力条目带可选描述正文，注册可分片的独立适配器
  (["honor", "language"] as const).forEach((moduleKey) => {
    registry.register(moduleKey, createDescribedItemModuleAdapter(moduleKey));
  });
  MEDIA_MODULE_KEYS.forEach((moduleKey) => {
    registry.register(moduleKey, createMediaModuleAdapter(moduleKey));
  });
  registry.registerFallback(createCustomModuleFallback);
};
