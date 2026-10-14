import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "点线正文", // 主题显示名称
  id: "pointBody" as const, // 主题编号，供外观组件按编号选择
  design: ["single-column", "minimal"], // 模板列表分类标签：单栏、简约
  description: "正文段落以主题色方点起头并拉开段距，长段落读起来更像文稿。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    layoutType: "topUserSingleColumn", // 个人信息置顶、正文单栏
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题色与标题绘制
      color: "#4A6141", // 主题色：苔绿，用于段首方点与标题引线
      titleTemplate: "dotTrailRule", // 模块标题复用已登记的圆点引线，与段首方点同族
    },
  },
} satisfies ThemeTemplateConfig;
