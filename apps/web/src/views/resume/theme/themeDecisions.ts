import { isPageLayoutTemplateId, type PageLayoutTemplateId } from "./layouts";
import { resumeThemeRegistry } from "./styles";

/**
 * 主题决策字段：由主题定义决定、编辑器不提供修改入口，因此只按主题编号解析，
 * 不进入简历 ui 或其运行时展开对象，固定外观与用户可编辑参数始终分开。
 */
export interface ThemeDecisions {
  /** 页面版式编号 */
  layoutType: PageLayoutTemplateId;
  /** 纸张圆角，单位像素 */
  pageRadius: number;
  /** 纸张边框宽度与颜色 */
  pageBorder: {
    /** 边框宽度，单位像素 */
    width: number;
    /** 边框颜色 */
    color: string;
  };
  /** 页面背景纹理编号，未声明表示不使用纹理 */
  pageBackgroundPattern?: string;
}

// 固定外观默认值仅在主题层维护，不进入用户界面配置。
export const DEFAULT_THEME_DECISIONS: ThemeDecisions = {
  layoutType: "singleColumn", // 默认页面版式
  pageRadius: 24, // 默认纸张圆角，单位像素
  pageBorder: { // 默认纸张边框
    width: 0, // 默认不描边
    color: "#e9edf0", // 默认边框颜色
  },
};

// 主题定义是静态数据，同一主题只解析一次
const decisionCache = new Map<string, ThemeDecisions>();

/** 按主题编号解析主题决策字段：未知主题回退默认主题的声明 */
export const resolveThemeDecisions = (themeId?: string): ThemeDecisions => {
  const id = typeof themeId === "string" && resumeThemeRegistry[themeId] ? themeId : "default";
  const cached = decisionCache.get(id);
  if (cached) return cached;
  const themeDecisions = resumeThemeRegistry[id]?.decisions ?? {};
  const layoutType = themeDecisions.layoutType;
  const decisions: ThemeDecisions = {
    layoutType: isPageLayoutTemplateId(layoutType)
      ? layoutType
      : DEFAULT_THEME_DECISIONS.layoutType,
    pageRadius: Math.max(0, Number(themeDecisions.pageRadius ?? DEFAULT_THEME_DECISIONS.pageRadius) || 0),
    pageBorder: {
      width: Math.max(0, Number(themeDecisions.pageBorder?.width ?? DEFAULT_THEME_DECISIONS.pageBorder.width) || 0),
      color: themeDecisions.pageBorder?.color ?? DEFAULT_THEME_DECISIONS.pageBorder.color,
    },
    ...(themeDecisions.pageBackgroundPattern
      ? { pageBackgroundPattern: themeDecisions.pageBackgroundPattern }
      : {}),
  };
  decisionCache.set(id, decisions);
  return decisions;
};
