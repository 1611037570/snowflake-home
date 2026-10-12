import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  /** 主题展示名称 */
  name: "三层箭头",
  /** 主题与标题组件的匹配标识 */
  id: "chevronRibbon" as const, // 主题编号
  /** 主题筛选分类 */
  design: ["single-column", "plain"], // 移至极简分类
  /** 主题样式说明 */
  description: "标题落在三层箭头形色块上。",
  /** 标题外观设置 */
  ui: {
    /** 标题主题设置 */
    theme: {
      /** 箭头标题与长条底纹的主题色 */
      color: "#9B59DC",
      titleTemplate: "chevronArrow", // 模块标题样式：三层箭头
    },
  },
} satisfies ThemeTemplateConfig;
