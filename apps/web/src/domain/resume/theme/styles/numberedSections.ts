import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  /** 主题展示名称 */
  name: "序号前缀",
  /** 主题与标题组件的匹配标识 */
  id: "numberedSections" as const,
  /** 主题筛选分类 */
  design: ["single-column", "plain"],
  /** 主题样式说明 */
  description: "模块标题前自动补两位序号。",
  /** 标题外观设置 */
  ui: {
    /** 标题主题设置 */
    theme: {
      /** 模块序号使用的深蓝灰色 */
      color: "#42536B",
      titleTemplate: "numberedPrefix", // 模块标题样式：序号前缀
    },
  },
} satisfies ThemeTemplateConfig;
