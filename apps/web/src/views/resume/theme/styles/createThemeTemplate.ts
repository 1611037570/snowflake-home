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
  ui?: Record<string, any>;
}

export interface ResumeThemeDefinition extends ThemeTemplateConfig {
  ui: Record<string, any>;
}

// 在注册表统一补齐空覆盖项，主题文件只保留声明内容。
export const createThemeTemplates = (
  definitions: ThemeTemplateConfig[],
): ResumeThemeDefinition[] =>
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
    },
    font: { ...DEFAULT_UI.font, ...ui.font },
    content: { ...DEFAULT_UI.content, ...ui.content },
    theme: { ...DEFAULT_UI.theme, template: id, ...ui.theme },
    layout: { ...DEFAULT_UI.layout, ...ui.layout },
    user: { ...DEFAULT_UI.user, ...ui.user },
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
