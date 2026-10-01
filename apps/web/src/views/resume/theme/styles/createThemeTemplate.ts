import { DEFAULT_UI } from "@/stores/modules/resume/config/uiConfig";

export interface ResumeThemeTemplate {
  name: string;
  id: string;
  description: string;
  item: {
    data: Record<string, unknown>;
    config: Record<string, unknown>;
    ui: Record<string, any>;
  };
}

export interface ThemeTemplateConfig {
  name: string;
  id: string;
  description: string;
  /**
   * 主题分类标签，取值与内容模板的 design 完全同一套：
   * single-column 单栏、two-column 双栏、minimal 简约、timeline 时间轴、polished 精美。
   * 模板页按该字段筛选，样式卡片与内容卡片共用同一个筛选字段名。
   */
  design: string[];
  /**
   * 主题自带的样例范本：填写内容范本文件名（含 .ts）后，
   * 样式卡片与「使用模板」都用这条范本的内容，主题不再局限于通用范本的模块清单。
   */
  sample?: {
    /** 内容范本文件名，例如 sloganBanner.ts */
    fileName: string;
  };
  ui?: Record<string, any>;
}

export interface ResumeThemeDefinition extends ThemeTemplateConfig {
  ui: Record<string, any>;
}

// 在注册表统一补齐空覆盖项，主题文件只保留声明内容。
export const createThemeTemplates = (definitions: ThemeTemplateConfig[]): ResumeThemeDefinition[] =>
  definitions.map((definition) => ({
    ...definition,
    ui: definition.ui || {},
  }));

// 在主题被预览或应用时生成完整配置。
export const resolveThemeTemplate = (definition: ResumeThemeDefinition): ResumeThemeTemplate => {
  const { id, ui } = definition;
  const presetUi = {
    ...DEFAULT_UI,
    ...ui,
    page: {
      ...DEFAULT_UI.page,
      ...ui.page,
      padding: { ...DEFAULT_UI.page.padding, ...ui.page?.padding },
      spacing: { ...DEFAULT_UI.page.spacing, ...ui.page?.spacing },
      // 纸张边框按字段合并：主题只声明颜色时宽度仍沿用默认值
      border: { ...DEFAULT_UI.page.border, ...ui.page?.border },
    },
    font: { ...DEFAULT_UI.font, ...ui.font },
    content: { ...DEFAULT_UI.content, ...ui.content },
    theme: { ...DEFAULT_UI.theme, template: id, ...ui.theme },
    layout: { ...DEFAULT_UI.layout, ...ui.layout },
    user: { ...DEFAULT_UI.user, ...ui.user },
    // 区域留白按槽位逐层合并：主题只覆盖某个槽位的区域，其余槽位沿用默认值
    region: {
      ...DEFAULT_UI.region,
      ...ui.region,
      ...Object.fromEntries(
        Object.entries(ui.region || {}).map(([slot, value]) => [
          slot,
          {
            ...(DEFAULT_UI.region as Record<string, any>)[slot],
            ...(value as Record<string, any>),
            padding: {
              ...(DEFAULT_UI.region as Record<string, any>)[slot]?.padding,
              ...(value as Record<string, any>)?.padding,
            },
          },
        ]),
      ),
    },
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
