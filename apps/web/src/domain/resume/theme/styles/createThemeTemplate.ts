import type { ThemeDecisions } from "@/domain/resume/theme/themeDecisions";
import { resolveTitleStyleDefinition } from "@/domain/resume/theme/titleStyles";
import type { ResumeUi, ThemeUiPreset } from "@/domain/resume/theme/uiTypes";
import { DEFAULT_UI } from "@/domain/resume/theme/uiConfig";

export interface ResumeThemeTemplate {
  name: string; // 主题显示名称
  id: string; // 主题编号
  description: string; // 主题说明
  item: { // 应用主题时使用的简历初始配置
    data: Record<string, unknown>; // 简历内容占位
    config: Record<string, unknown>; // 模块配置占位
    ui: ResumeUi; // 完整用户界面预设
  };
}

/** 主题声明的页面级外观：公共页面按主题编号读取，不再按主题名称判断 */
export interface ThemePageAppearance {
  /** 首页顶部是否由内容底色铺到纸张顶边 */
  bleedsPageTop?: boolean;
  /** 编辑器预览是否去掉页面底边线，用于正文自带圆角的主题 */
  openBottomBorder?: boolean;
}

export interface ThemeTemplateConfig {
  name: string; // 主题显示名称
  id: string; // 主题编号
  description: string; // 主题说明
  localeId?: string; // 模板卡片复用的翻译文案编号，缺省使用主题编号
  /**
   * 主题分类标签，取值与内容模板的 design 完全同一套：
   * single-column 单栏、two-column 双栏、timeline 时间轴、recommended 推荐、premium 臻品、polished 精致、minimal 简约、plain 极简。
   * 模板页按该字段筛选，样式卡片与内容卡片共用同一个筛选字段名。
   */
  design: ("single-column" | "two-column" | "timeline" | "recommended" | "premium" | "polished" | "minimal" | "plain")[];
  /** 主题页面级外观声明，公共页面读取该声明而不是判断主题编号 */
  pageAppearance?: ThemePageAppearance;
  /** 主题固定版式、装饰尺寸及内容能力，不属于用户可编辑参数 */
  decisions?: Partial<ThemeDecisions>;
  ui?: ThemeUiPreset; // 主题组件选择、正文颜色及可调参数的默认值
}

export interface ResumeThemeDefinition extends ThemeTemplateConfig {
  ui: ThemeUiPreset; // 主题组件选择、正文颜色及可调参数的默认值
}

// 在注册表统一补齐空覆盖项，主题文件只保留声明内容。
export const createThemeTemplates = <T extends ThemeTemplateConfig>(definitions: T[]): (T & ResumeThemeDefinition)[] =>
  definitions.map((definition) => ({
    ...definition,
    ui: definition.ui || {},
  }));

// 在主题被预览或应用时生成简历 ui 预设。
// 主题决策字段（layout.type、page.border、page.backgroundPattern）不入预设：
// 它们由主题 decisions 单独声明，运行时也不合入用户界面配置。
// 模块标题参数（图标模式、标题字号）由主题在 ui.theme.titleTemplate 中指定的标题样式提供，主题不再各自声明。
export const resolveThemeTemplate = (definition: ResumeThemeDefinition): ResumeThemeTemplate => {
  const { id, ui } = definition;
  // 标题样式自带默认参数：主题只负责指向用哪套标题样式，参数随样式走
  const titleStyle = resolveTitleStyleDefinition(ui.theme?.titleTemplate);
  const presetUi: ResumeUi = {
    ...DEFAULT_UI,
    ...ui,
    page: {
      background: ui.page?.background ?? DEFAULT_UI.page.background,
      footer: ui.page?.footer ?? DEFAULT_UI.page.footer,
      footerTemplate: ui.page?.footerTemplate ?? DEFAULT_UI.page.footerTemplate, // 页尾模板沿用用户或默认选择。
      padding: { ...DEFAULT_UI.page.padding, ...ui.page?.padding },
      spacing: { ...DEFAULT_UI.page.spacing, ...ui.page?.spacing },
    },
    font: {
      ...DEFAULT_UI.font,
      ...ui.font,
      titleSize: ui.font?.titleSize ?? titleStyle?.titleSize ?? DEFAULT_UI.font.titleSize,
    },
    content: { ...DEFAULT_UI.content, ...ui.content },
    theme: {
      ...DEFAULT_UI.theme,
      ...ui.theme,
      titleIconMode: ui.theme?.titleIconMode ?? titleStyle?.titleIconMode ?? DEFAULT_UI.theme.titleIconMode,
      template: id,
    },
    layout: {
      columns: ui.layout?.columns ?? DEFAULT_UI.layout.columns,
      leftColumnWidth: ui.layout?.leftColumnWidth ?? DEFAULT_UI.layout.leftColumnWidth,
    },
    user: { ...DEFAULT_UI.user, ...ui.user },
    skill: { ...DEFAULT_UI.skill, ...ui.skill },
    honor: { ...DEFAULT_UI.honor, ...ui.honor }, // 荣誉布局沿用主题或默认展示方式。
  };

  return {
    name: definition.name,
    id,
    description: definition.description,
    item: {
      data: {},
      config: {},
      ui: presetUi,
    },
  };
};
