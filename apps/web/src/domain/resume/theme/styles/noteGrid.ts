import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "格纸手帐", // 主题显示名称
  id: "noteGrid" as const, // 主题编号，供外观组件按编号选择
  design: ["single-column", "premium"], // 模板列表分类标签：单栏、臻品
  description: "浅米色方格纸搭配暖棕标题签，保留手帐质感而不干扰正文。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    pageBackgroundPattern: "noteGrid", // 主题固定页面纹理：方格纸
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题色与标题绘制
      color: "#95664D", // 主题色：暖棕色用于标题签与浅格线
      titleTemplate: "noteGridTab", // 模块标题样式：手帐标题签
      titleIconMode: "none", // 默认不显示图标，保持手帐标题的简洁
    },
    page: { // 纸张外观
      background: "#FFFCF6", // 纸张底色：浅米白以降低网格对正文的干扰
    },
  },
} satisfies ThemeTemplateConfig;
