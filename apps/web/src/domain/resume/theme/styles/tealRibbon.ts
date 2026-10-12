import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "青色旗帜", // 主题显示名称
  id: "tealRibbon" as const, // 主题编号
  design: ["single-column", "plain"], // 模板筛选分类
  description: "模块标题以青色旗帜从纸张左缘延伸，右端形成燕尾缺口。", // 主题说明
  ui: {
    // 用户可调参数的主题默认值
    theme: { color: "#35B2BA" }, // 标题旗帜的默认青色
  },
} satisfies ThemeTemplateConfig;
