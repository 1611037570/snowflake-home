import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  /** 主题展示名称 */
  name: "斜纹飘带",
  /** 主题与标题组件的匹配标识 */
  id: "stripedRibbon" as const, // 主题编号
  /** 主题筛选分类 */
  design: ["single-column", "plain"], // 纯标题主题只归入单栏与极简分类
  /** 主题样式说明 */
  description: "斜切飘带标题搭配两道平行斜纹，左下深色折角增添层次。",
  /** 标题外观设置 */
  ui: {
    /** 标题主题设置 */
    theme: {
      /** 飘带标题与斜纹的主题色 */
      color: "#3286D5",
      titleTemplate: "foldedRibbon", // 模块标题样式：折角飘带
    },
  },
} satisfies ThemeTemplateConfig;
