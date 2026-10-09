import { DEFAULT_UI } from "@/stores/modules/resume/config/uiConfig";
import { isPageLayoutTemplateId, type PageLayoutTemplateId } from "./layouts";
import { resumeThemeRegistry } from "./styles";

/**
 * 主题决策字段：由主题定义决定、编辑器不提供修改入口，因此只按主题编号解析，
 * 不写入简历 ui，避免同一份外观在「主题定义」与「简历快照」里各存一份而脱钩。
 */
export interface ThemeDecisions {
  /** 页面版式编号 */
  layoutType: PageLayoutTemplateId;
  /** 纸张圆角，单位像素 */
  pageRadius: number;
  /** 纸张边框宽度与颜色 */
  pageBorder: { width: number; color: string };
  /** 页面背景纹理编号，未声明表示不使用纹理 */
  pageBackgroundPattern?: string;
}

// 主题定义是静态数据，同一主题只解析一次
const decisionCache = new Map<string, ThemeDecisions>();

/** 按主题编号解析主题决策字段：未知主题回退默认主题的声明 */
export const resolveThemeDecisions = (themeId?: string): ThemeDecisions => {
  const id = typeof themeId === "string" && resumeThemeRegistry[themeId] ? themeId : "default";
  const cached = decisionCache.get(id);
  if (cached) return cached;
  const themeUi = resumeThemeRegistry[id]?.ui ?? {};
  const layoutType = themeUi.layout?.type;
  const decisions: ThemeDecisions = {
    layoutType: isPageLayoutTemplateId(layoutType)
      ? layoutType
      : isPageLayoutTemplateId(DEFAULT_UI.layout.type)
        ? DEFAULT_UI.layout.type
        : "singleColumn",
    pageRadius: Math.max(0, Number(themeUi.page?.radius ?? DEFAULT_UI.page.radius) || 0),
    pageBorder: {
      width: Math.max(0, Number(themeUi.page?.border?.width ?? DEFAULT_UI.page.border.width) || 0),
      color: themeUi.page?.border?.color ?? DEFAULT_UI.page.border.color,
    },
    ...(themeUi.page?.backgroundPattern
      ? { pageBackgroundPattern: themeUi.page.backgroundPattern as string }
      : {}),
  };
  decisionCache.set(id, decisions);
  return decisions;
};

/**
 * 把主题决策字段注入运行时 ui。
 * 预览、分页引擎与导出共用这一份运行时 ui，落库的 ui 里不含这些字段，主题调整能立刻生效。
 */
export const withThemeDecisions = (ui: Record<string, any> | undefined): Record<string, any> => {
  const source = ui && typeof ui === "object" ? ui : {};
  const decisions = resolveThemeDecisions(source.theme?.template);
  return {
    ...source,
    layout: { ...source.layout, type: decisions.layoutType },
    page: {
      ...source.page,
      radius: decisions.pageRadius,
      border: decisions.pageBorder,
      ...(decisions.pageBackgroundPattern
        ? { backgroundPattern: decisions.pageBackgroundPattern }
        : {}),
    },
  };
};
