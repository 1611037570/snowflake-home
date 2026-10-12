import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";

export default {
  /** 主题展示名称 */
  name: "实色块横线",
  /** 主题与标题组件的匹配标识 */
  id: "labelLine" as const, // 主题编号
  /** 主题筛选分类 */
  design: ["single-column", "plain"],
  /** 主题样式说明 */
  description: "实心色块承载标题，底边接通栏细线。",
  /** 仅覆盖标题相关外观，条目沿用默认样式 */
  ui: {
    /** 标题色块使用深蓝主题色 */
    theme: {
      /** 标题色块底色 */
      color: "#1E3A5F",
      titleTemplate: "solidLabelRule", // 模块标题样式：实色块横线
    },
  },
} satisfies ThemeTemplateConfig;
