import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  /** 主题展示名称 */
  name: "圆点引线",
  /** 主题与标题组件的匹配标识 */
  id: "badgeLine" as const,
  /** 主题筛选分类 */
  design: ["single-column", "plain"],
  /** 主题样式说明 */
  description: "标题后一个圆点，细线延伸到右边距。",
  /** 标题外观设置 */
  ui: {
    /** 标题主题设置 */
    theme: {
      /** 圆形图标、圆点与横线的主题色 */
      color: "#EE7475",
      titleTemplate: "dotTrailRule", // 模块标题样式：圆点引线
    },
  },
} satisfies ThemeTemplateConfig;
