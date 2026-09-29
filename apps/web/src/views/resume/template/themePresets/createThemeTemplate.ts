import { DEFAULT_UI } from "@/stores/modules/resume/config/uiConfig";

export interface ThemeItemStyle {
  background: string;
  borderColor: string;
  radius: string;
  padding: number;
}

export interface ThemeAppearance {
  moduleTitle: string; // 模块标题使用的样式组件
  moduleFrame: "default" | "outline"; // 普通模块的边框样式
  item: ThemeItemStyle; // 经历条目的背景、描边、圆角与内边距
}

export type ThemeAppearanceOverrides = Omit<Partial<ThemeAppearance>, "item"> & {
  item?: Partial<ThemeItemStyle>;
};

export interface ResumeThemeTemplate {
  name: string;
  id: string;
  description: string;
  item: {
    data: Record<string, unknown>;
    config: Record<string, unknown>;
    ui: Record<string, any>;
  };
  appearance: ThemeAppearance;
}

export interface ThemeTemplateConfig {
  name: string;
  id: string;
  description: string;
  ui?: Record<string, any>;
  appearance?: ThemeAppearanceOverrides;
}

export interface ResumeThemeDefinition extends ThemeTemplateConfig {
  ui: Record<string, any>;
  appearance: ThemeAppearanceOverrides;
}

const defaultThemeItemStyle: ThemeItemStyle = {
  background: "transparent",
  borderColor: "transparent",
  radius: "0",
  padding: 0,
};

// 在注册表统一补齐空覆盖项，主题文件只保留声明内容。
export const createThemeTemplates = (
  definitions: ThemeTemplateConfig[],
): ResumeThemeDefinition[] =>
  definitions.map((definition) => ({
    ...definition,
    ui: definition.ui || {},
    appearance: definition.appearance || {},
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
    appearance: {
      moduleTitle: definition.appearance.moduleTitle ?? "default",
      moduleFrame: definition.appearance.moduleFrame ?? "default",
      item: { ...defaultThemeItemStyle, ...definition.appearance.item },
    },
  };
};
