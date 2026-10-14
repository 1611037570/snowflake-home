import type { PageLayoutTemplateId } from "@/domain/resume/theme/layouts";
import { resumeThemeRegistry } from "@/domain/resume/theme/styles";
import type { ThemeCapabilities } from "@/domain/resume/theme/themeContract";
import { validateThemeDecisions } from "@/domain/resume/theme/themeContract";
import { resolveUserTemplate } from "@/domain/resume/theme/userTemplates";
// 编号取自真实文件清单，配置解析不引入渲染组件。
const componentIds = (files: Record<string, unknown>) => new Set(
  Object.keys(files).map((file) => file.slice(file.lastIndexOf("/") + 1, -4)),
);
const pageDecorationIds = componentIds(import.meta.glob("/src/views/resume/theme/components/pageDecoration/themes/*.vue"));
const pageAppearanceIds = componentIds(import.meta.glob("/src/views/resume/theme/components/pageContainer/themes/*.vue"));

/**
 * 主题决策字段：由主题定义决定、编辑器不提供修改入口，因此只按主题编号解析，
 * 不进入简历 ui 或其运行时展开对象，固定外观与用户可编辑参数始终分开。
 */
export interface ThemeDecisions extends ThemeCapabilities {
  /** 页面版式编号 */
  layoutType: PageLayoutTemplateId;
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
  const errors = validateThemeDecisions(themeDecisions);
  // 个人信息模板在主题预设中声明，组件与分页能力由同一清单校验。
  const userTemplate = resumeThemeRegistry[id]?.ui.theme?.userTemplate;
  // 这里只利用解析的登记校验副作用，契约由渲染层另行解析，返回值不消费。
  void resolveUserTemplate(userTemplate, themeDecisions.layoutType ?? DEFAULT_THEME_DECISIONS.layoutType);
  if (themeDecisions.topDecoration && !errors.includes("topDecoration")) {
    if (!pageDecorationIds.has(themeDecisions.topDecoration)) errors.push("topDecoration");
  }
  if (themeDecisions.pageBackgroundPattern && !pageAppearanceIds.has(themeDecisions.pageBackgroundPattern)) errors.push("pageBackgroundPattern");
  if (errors.length) throw new Error(`主题固定声明无效：${id} ${errors.join("、")}`);
  const layoutType = themeDecisions.layoutType;
  const decisions: ThemeDecisions = {
    ...themeDecisions,
    layoutType: layoutType ?? DEFAULT_THEME_DECISIONS.layoutType,
    pageBorder: {
      width: themeDecisions.pageBorder?.width ?? DEFAULT_THEME_DECISIONS.pageBorder.width,
      color: themeDecisions.pageBorder?.color ?? DEFAULT_THEME_DECISIONS.pageBorder.color,
    },
    ...(themeDecisions.pageBackgroundPattern
      ? { pageBackgroundPattern: themeDecisions.pageBackgroundPattern }
      : {}),
  };
  decisionCache.set(id, decisions);
  return decisions;
};
