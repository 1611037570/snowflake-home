import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "夹线页头", // 主题显示名称
  id: "ruleHead" as const, // 主题编号，供外观组件按编号选择
  design: ["single-column", "minimal"], // 模板列表分类标签：单栏、简约
  description: "个人信息区只用上下两条细线夹出边界，不上底色也不加外框。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    layoutType: "topUserSingleColumn", // 个人信息置顶、正文单栏
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题色与标题绘制
      color: "#7A5B3C", // 主题色：茶褐，用于页头两条界线与标题底线
      titleTemplate: "hairlineRule", // 模块标题复用已登记的极细底线，与页头细线同一套语言
    },
  },
} satisfies ThemeTemplateConfig;
