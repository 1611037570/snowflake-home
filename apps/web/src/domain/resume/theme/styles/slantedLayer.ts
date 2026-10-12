import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  /** 主题展示名称 */
  name: "斜切叠片",
  /** 主题与标题组件的匹配标识 */
  id: "slantedLayer" as const, // 主题编号
  /** 主题筛选分类 */
  design: ["single-column", "plain"], // 移至极简分类
  /** 主题样式说明 */
  description: "标题落在斜切色块上，右下方叠一层浅色背片。",
  /** 标题外观设置 */
  ui: {
    /** 标题主题设置 */
    theme: {
      /** 标题色块、背片与横线的主题色 */
      color: "#25677D",
      titleTemplate: "slantedLayers", // 模块标题样式：斜切叠片
    },
  },
} satisfies ThemeTemplateConfig;
