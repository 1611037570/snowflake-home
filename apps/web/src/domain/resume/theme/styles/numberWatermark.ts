import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  name: "水印序号", // 主题显示名称
  id: "numberWatermark" as const, // 主题编号，供外观组件按编号选择
  design: ["single-column", "minimal"], // 模板列表分类标签：单栏、简约
  description: "模块右上角一枚淡色大序号充当节奏标记，正文保持素净。", // 主题说明
  decisions: { // 主题固定外观，不进入用户界面配置
    layoutType: "topUserSingleColumn", // 个人信息置顶、正文单栏
  },
  ui: { // 主题相对默认配置的差异
    theme: { // 主题色与标题绘制
      color: "#2E4B7A", // 主题色：靛蓝，用于水印序号与标题
      titleTemplate: "shortUnderline", // 模块标题复用已登记的短下划线，与淡序号拉开主次
    },
  },
} satisfies ThemeTemplateConfig;
