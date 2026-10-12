import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  /** 主题展示名称 */
  name: "斜切色块",
  /** 主题与标题组件的匹配标识 */
  id: "angledLine" as const, // 主题编号
  /** 主题筛选分类 */
  design: ["single-column", "plain"], // 移至极简分类
  /** 主题样式说明 */
  description: "标题落在右端斜切的实色块上。",
  /** 主题外观配置 */
  ui: {
    /** 标题色块与竖线的主题设置 */
    theme: {
      /** 标题色块使用青绿色 */
      color: "#007F88",
      titleTemplate: "beveledLabel", // 模块标题样式：斜切色块
    },
  },
} satisfies ThemeTemplateConfig;
